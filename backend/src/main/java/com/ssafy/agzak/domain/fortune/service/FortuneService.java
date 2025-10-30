package com.ssafy.agzak.domain.fortune.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.response.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FortuneService {
    private RestClient restClient;
    private final AstrologyCalculationService calculationService;

    @Value("${gms.base-url}")
    private String gmsBaseUrl;
    @Value("${gms.api-key}")
    private String gmsApiKey;
    @Value("${gms.model}")
    private String gmsModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private String userTemplate = """
        사용자 데이터
        
        1. 출생 차트 (Natal Data)
        * 상승점(AC): {{ascSign}}
        * 중천점(MC): {{mcSign}}
        {{natalPlanetsString}}
        
        2. 오늘의 천체 운행 (Transit Data)
        {{transitPlanetsString}}
        
        3. 오늘의 핵심 어스펙트 (Today's Key Aspects)
        {{aspectsString}}
        """;

    private String systemPrompt = """
        시스템 지시사항
        너는 제공된 출생 차트와 트랜싯 데이터를 바탕으로 5가지 영역의 '오늘의 운세 점수'를 계산하는 전문 점성가다.
        반드시 **아래 키만 포함한 단일 JSON 객체**로만 출력한다. 어떠한 설명/문장/코드펜스/마크다운도 금지한다.
        문자열로 감싸지 말고, JSON 최상위에 바로 객체를 출력한다.
        
        제약:
        - 모든 점수는 0~100의 정수.
        - 키 순서는 아래와 동일하게 유지.
        - NaN/Infinity/빈값/추가 키 금지.
        - 출력은 공백/개행 포함 가능하나 **JSON 객체만** 존재해야 한다.
        
        필수 출력 형식(키/타입 고정):
        {
          "total_score": number,
          "romance_score": number,
          "health_score": number,
          "wealth_score": number,
          "achievement_score": number,
          "total_summary": string,
          "detailed_summaries": {
            "romance": string,
            "health": string,
            "wealth": string,
            "achievement": string
          }
        }
        
        점수 계산 가이드라인:
        - 연애운: Natal 금성/화성, 5/7하우스, 관련 트랜싯 어스펙트.
        - 금전운: Natal 금성/목성, 2/8하우스, 관련 트랜싯 어스펙트.
        - 건강운: Natal 화성/토성, 6하우스, 관련 트랜싯 어스펙트.
        - 성취운: Natal 태양/화성, 10하우스(MC), 관련 트랜싯 어스펙트.
        - 총운세: 긍/부정 어스펙트의 개수·강도 종합.
        
        아래 규칙을 마지막으로 한 번 더 상기:
        - **JSON만 출력**, 따옴표로 감싸지 말 것, 코드블록(````), 주석, 추가 텍스트 금지.
        """;;

    public FortuneScoreResponse getFortuneScores(BirthDataInput input) {
        restClient = RestClient.builder()
                .baseUrl(gmsBaseUrl)
                .defaultHeaders(headers -> {
                    headers.setBearerAuth(gmsApiKey); // Authorization: Bearer $GMS_KEY
                    headers.set("Content-Type", "application/json");
                })
                .build();

        // 1. 점성술 데이터 객체 생성
        AiPromptData aiData = calculationService.generateAiPromptData(input);

        // 2. 데이터 -> 문자열 변환
        String natalPlanetsString = formatNatalPlanets(aiData.natalPlanets());
        String transitPlanetsString = formatTransitPlanets(aiData.transitPlanets());
        String aspectsString = formatAspects(aiData.aspects());

        // 3. 사용자 프롬프트 템플릿(userTemplate)의 변수 수동 치환
        String userContent = userTemplate
                .replace("{{ascSign}}", aiData.ascendantSign())
                .replace("{{mcSign}}", aiData.mcSign())
                .replace("{{natalPlanetsString}}", natalPlanetsString)
                .replace("{{transitPlanetsString}}", transitPlanetsString)
                .replace("{{aspectsString}}", aspectsString);

        String jsonRequestBody = """
            {
              "model": "%s",
              "messages": [
                {
                  "role": "developer",
                  "content": %s
                },
                {
                  "role": "user",
                  "content": %s
                }
              ]
            }
            """.formatted(
                gmsModel,
                // objectMapper를 사용해 프롬프트 문자열을 'JSON 문자열 값'으로 안전하게 변환 (이스케이프 처리)
                objectMapper.valueToTree(systemPrompt).toString(),
                objectMapper.valueToTree(userContent).toString()
        );

        log.info("--- GMS Request (Raw JSON Body) ---");
        log.info(jsonRequestBody);

        return restClient.post()
                .uri("/chat/completions")
                // .body(chatRequest) 대신 .body(String) 사용
                .body(jsonRequestBody)
                .retrieve()
                .body(FortuneScoreResponse.class);
    }

    private String formatNatalPlanets(List<NatalPlanetInfo> planets) {
        StringBuilder sb = new StringBuilder();
        for (NatalPlanetInfo planet : planets) {
            sb.append(String.format("* %s: %s (%d 하우스)\n",
                    planet.name(), planet.sign(), planet.house()));
        }
        return sb.toString().trim(); // 마지막 줄바꿈 제거
    }

    private String formatTransitPlanets(List<TransitPlanetInfo> planets) {
        StringBuilder sb = new StringBuilder();
        for (TransitPlanetInfo planet : planets) {
            sb.append(String.format("* %s: %s\n",
                    planet.name(), planet.sign()));
        }
        return sb.toString().trim();
    }

    private String formatAspects(List<AspectInfo> aspects) {
        StringBuilder sb = new StringBuilder();
        for (AspectInfo aspect : aspects) {
            // (참고) 긍정/부정 판단 로직을 여기에 추가하면 더 좋습니다.
            String aspectType = aspect.aspectType();
            String mood = "[정보]";
            if (aspectType.contains("Trine") || aspectType.contains("Sextile")) {
                mood = "[긍정]";
            } else if (aspectType.contains("Square") || aspectType.contains("Opposition")) {
                mood = "[부정]";
            }

            sb.append(String.format("* %s %s (Transit)이 %s (Natal)과 %s (오차: %.1f°)\n",
                    mood, aspect.transitPlanet(), aspect.natalPlanet(), aspect.aspectType(), aspect.orb()));
        }
        return sb.toString().trim();
    }

    private record ChatRequest(
            @JsonProperty("model") String model,
            @JsonProperty("messages") List<Message> messages
    ) {}

    private record Message(
            @JsonProperty("role") String role,
            @JsonProperty("content") String content
    ) {}
}
