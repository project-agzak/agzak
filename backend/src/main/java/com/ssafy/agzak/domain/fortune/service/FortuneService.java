package com.ssafy.agzak.domain.fortune.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.response.*;
import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;
import com.ssafy.agzak.domain.fortune.entity.FortuneType;
import com.ssafy.agzak.domain.fortune.repository.FortuneAspectRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneTypeRepository;
import com.ssafy.agzak.domain.guest.dto.GuestProfile;
import com.ssafy.agzak.domain.guest.support.GuestProfileStore;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FortuneService {
    private RestClient restClient;
    private final AstrologyCalculationService calculationService;
    private final FortuneTypeRepository fortuneTypeRepository;
    private final MemberRepository memberRepository;
    private final FortuneRepository fortuneRepository;
    private final FortuneAspectRepository fortuneAspectRepository;
    private final GuestProfileStore guestStore;

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
        문자열로 감싸지 말고, JSON 최상위에 바로 객체를 출력한다. 답변은 반드시 한글로 줘
        
        제약:
        - 모든 점수는 0~250의 정수.
        - 키 순서는 아래와 동일하게 유지.
        - NaN/Infinity/빈값/추가 키 금지.
        - 출력은 공백/개행 포함 가능하나 **JSON 객체만** 존재해야 한다.
        - total_score는 나머지 영역의 합으로 줘
        필수 출력 형식(키/타입 고정):
        {
          "total_score": number,
          "romance": number,
          "health": number,
          "wealth": number,
          "achievement": number,
          "total_summary": string ("오늘의 총 운세 요약..."),
          "detailed_summaries": {
            "love": "연애운 요약...",
            "health": "건강운 요약...",
            "wealth": "금전운 요약...",
            "achievement": "성취운 요약..."
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

    public FinalFortuneResponse getFortuneScores(BirthDataInput input) {
        restClient = RestClient.builder()
                .baseUrl(gmsBaseUrl)
                .defaultHeaders(headers -> {
                    headers.setBearerAuth(gmsApiKey);
                    headers.set("Content-Type", "application/json");
                })
                .build();

        AiPromptData aiData = calculationService.generateAiPromptData(input);

        String natalPlanetsString = formatNatalPlanets(aiData.natalPlanets());
        String transitPlanetsString = formatTransitPlanets(aiData.transitPlanets());
        String aspectsString = formatAspects(aiData.aspects());

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
                objectMapper.valueToTree(systemPrompt).toString(),
                objectMapper.valueToTree(userContent).toString()
        );

        JsonNode fullResponseNode = restClient.post()
                .uri("/chat/completions")
                .body(jsonRequestBody)
                .retrieve()
                .body(JsonNode.class);

        String innerJsonString = null;
        if (fullResponseNode != null) {
            innerJsonString = fullResponseNode
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText(null);
        }

        if (innerJsonString == null) {
            log.error("AI response structure is invalid or content string is missing!");
            log.error("Received Full Response: {}", fullResponseNode != null ? fullResponseNode.toString() : "null");
            return new FinalFortuneResponse(null,null);
        }

        FortuneScoreResponse scores;
        try {
            scores = objectMapper.readValue(innerJsonString, FortuneScoreResponse.class);
            FortuneType fortuneType = determineFortuneType(scores);
            return new FinalFortuneResponse(scores, FortuneTypeResponse.fromEntity(fortuneType));

        } catch (IOException e) {
            log.error("내부 JSON 문자열 파싱 실패: {}", e.getMessage());
            return new FinalFortuneResponse(null,null);
        }
    }

    @Transactional
    public String saveGuestProfile(GuestProfile profile) {
        return guestStore.save(profile);
    }

    @Transactional
    public void saveFortune(long memberId, FinalFortuneResponse fortuneResponse) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 회원 아이디입니다."));
        FortuneType fortuneType = fortuneTypeRepository.findFortuneTypeByFortuneTypeId(fortuneResponse.type().id())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 운세 타입입니다."));

        Fortune fortune = Fortune.builder()
                .member(member)
                .fortuneType(fortuneType)
                .description(fortuneResponse.scores().totalSummary())
                .score(fortuneResponse.scores().totalScore())
                .build();

        fortuneRepository.save(fortune);

        saveAspect(fortune, FortuneAspect.AspectName.LOVE, fortuneResponse.scores().love());
        saveAspect(fortune, FortuneAspect.AspectName.MONEY, fortuneResponse.scores().wealth());
        saveAspect(fortune, FortuneAspect.AspectName.HEALTH, fortuneResponse.scores().health());
        saveAspect(fortune, FortuneAspect.AspectName.ACHIEVEMENT, fortuneResponse.scores().achievement());
    }

    private void saveAspect(Fortune fortune, FortuneAspect.AspectName name, int score) {
        FortuneAspect aspect = FortuneAspect.builder()
                .fortune(fortune)
                .name(name)
                .score(score)
                .build();
        fortuneAspectRepository.save(aspect);
    }

    private String formatNatalPlanets(List<NatalPlanetInfo> planets) {
        StringBuilder sb = new StringBuilder();
        for (NatalPlanetInfo planet : planets) {
            sb.append(String.format("* %s: %s (%d 하우스)\n",
                    planet.name(), planet.sign(), planet.house()));
        }
        return sb.toString().trim();
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

    private FortuneType determineFortuneType(FortuneScoreResponse scores) {
        int wealth = scores.wealth();
        int health = scores.health();
        int romance = scores.love();
        int achievement = scores.achievement();

        Map<String, Integer> scoreMap = Map.of(
                "wealth", wealth,
                "health", health,
                "romance", romance,
                "achievement", achievement
        );

        // 최고 점수 찾기
        String maxKey = Collections.max(scoreMap.entrySet(), Map.Entry.comparingByValue()).getKey();
        // 최저 점수 찾기
        String minKey = Collections.min(scoreMap.entrySet(), Map.Entry.comparingByValue()).getKey();

        String name = "";
        if ("wealth".equals(maxKey) && "romance".equals(minKey)) {
            name = "소";
        }
        if ("wealth".equals(maxKey) && "achievement".equals(minKey)) {
            name = "쥐";
        }
        if ("wealth".equals(maxKey) && "health".equals(minKey)) {
            name = "용";
        }
        if ("romance".equals(maxKey) && "wealth".equals(minKey)) {
            name = "토끼";
        }
        if ("romance".equals(maxKey) && "achievement".equals(minKey)) {
            name = "양";
        }
        if ("romance".equals(maxKey) && "health".equals(minKey)) {
            name = "고양이";
        }
        if ("achievement".equals(maxKey) && "wealth".equals(minKey)) {
            name = "호랑이";
        }
        if ("achievement".equals(maxKey) && "romance".equals(minKey)) {
            name = "말";
        }
        if ("achievement".equals(maxKey) && "health".equals(minKey)) {
            name = "닭";
        }
        if ("health".equals(maxKey) && "wealth".equals(minKey)) {
            name = "개";
        }
        if ("health".equals(maxKey) && "romance".equals(minKey)) {
            name = "뱀";
        }
        if ("health".equals(maxKey) && "achievement".equals(minKey)) {
            name = "원숭이";
        }

        return fortuneTypeRepository.findFortuneTypeByName(name)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 운세 타입 이름이 없습니다."));
    }

    public void checkDuplicate(long memberId, LocalDate date) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 회원 아이디입니다."));

        if (fortuneRepository.existsByMemberAndDate(member, date)) {
            throw new IllegalArgumentException("이미 조회한 운세 정보가 있습니다. 날짜 조회를 이용하세요");
        }
    }
}
