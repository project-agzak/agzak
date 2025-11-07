package com.ssafy.agzak.domain.fortune.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.response.*;
import com.ssafy.agzak.domain.fortune.entity.FortuneType;
import com.ssafy.agzak.domain.fortune.repository.FortuneAspectRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneTypeRepository;
import com.ssafy.agzak.domain.guest.support.GuestProfileStore;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import com.ssafy.agzak.domain.ranking.service.RankingService;
import com.ssafy.agzak.global.time.DateProvider;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FortuneAiService {

    private RestClient restClient;
    private final AstrologyCalculationService calculationService;
    private final RankingService rankingService;
    private final FortuneTypeRepository fortuneTypeRepository;
    private final MemberRepository memberRepository;
    private final FortuneRepository fortuneRepository;
    private final FortuneAspectRepository fortuneAspectRepository;
    private final GuestProfileStore guestStore;
    private final DateProvider date;

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
        너는 제공된 출생 차트와 트랜싯 데이터를 바탕으로 5가지 영역의 '오늘의 운세 점수'를 계산하는 '전문 점성가'다.
        반드시 **아래 키만 포함한 단일 JSON 객체**로만 출력한다. 어떠한 설명/문장/코드펜스/마크다운도 금지한다.
        문자열로 감싸지 말고, JSON 최상위에 바로 객체를 출력한다. 답변은 반드시 한글로 줘 그리고 사용자 운세에 대해 설명해줘.
        
        제약:
        - 모든 점수는 0~250의 정수.
        - 키 순서는 아래와 동일하게 유지.
        - NaN/Infinity/빈값/추가 키 금지.
        - 출력은 공백/개행 포함 가능하나 **JSON 객체만** 존재해야 한다.
        - total_score는 나머지 영역의 합으로 줘
        - [매우 중요] 각 항목의 상한선은 250이다
        - [매우 중요] 각 항목 점수는 겹치지 않도록 한다.
        필수 출력 형식(키/타입 고정):
        {
          "total_score": number,
          "love": number (0~250),
          "health": number (0~250),
          "money": number (0~250),
          "achievement": number (0~250),
          "total_summary": string ("오늘의 총 운세 요약..."),
          "detailed_summaries": {
            "love": "연애운 설명 요약...",
            "health": "건강운 설명 요약...",
            "money": "금전운 설명 요약...",
            "achievement": "성취운 설명 요약..."
        }
        
    점수 계산 가이드라인:
      (신규) 긍정적 어스펙트(Trine, Sextile)는 점수를 증가시키고, 부정적 어스펙트(Square, Opposition)는 점수를 감소시킵니다. Conjunction은 행성의 성질에 따라 다르게 적용합니다.
      (신규-인플레이션 억제) **전반적인 점수 인플레이션을 막기 위해, 부정적 어스펙트의 감점 폭을 긍정적 어스펙트의 가점 폭보다 1.5배 더 강하게 반영하세요.**
      (신규) 모든 점수는 125점을 '보통' 기준으로 시작하여 가감하는 것을 권장합니다.

      (신규-역동성 확보) **[오늘의 운세 핵심]** '오늘의 운세'는 '일일 변화'를 반영해야 합니다.\s
      - 따라서 점수 계산 시, **트랜싯 달(Transit Moon)의 어스펙트**에 **높은 가중치** (전체 일일 변동 점수의 약 40-50%)를 부여합니다. (단, 아래 '성취운'/'건강운'의 예외 규칙 참조)
      - 트랜싯 목성과 토성의 어스펙트는 장기적인 '배경 운'으로 간주하며, 일일 점수 변동에는 상대적으로 **낮은 가중치**를 부여하여 점수가 매일 비슷해지는 것을 방지합니다.

      - 연애운: Natal 금성/화성, 5/7하우스, 관련 트랜싯 어스펙트.
      - 금전운: Natal 금성/목성, 2/8하우스, 관련 트랜싯 어스펙트. (신규: 트랜싯 토성의 부정적 어스펙트는 '지출/손실'로 감점 반영)

      - 건강운: ('화성'의 영향 분리)
          - **(핵심 정의):** '건강'은 '기본 활력(Sun)'과 '신체적 편안함(Venus)', '회복력(Jupiter)'이 '에너지 저하(Saturn)' 요인보다 우세한 상태를 의미합니다.
          - **(가점 요인):** 트랜싯 행성이 **Natal 태양(Sun, 기본 활력)**, **Natal 목성(Jupiter, 보호/회복)**, **Natal 금성(Venus, 편안함/웰빙)**과 **긍정적 어스펙트(Trine, Sextile)**를 맺을 때 점수를 증가시킵니다.
          - **(감점 요인):** 트랜싯 행성이 **Natal 토성(Saturn, 만성/에너지 저하)**, 6하우스와 **부정적 어스펙트(Square, Opposition, Conjunction)**를 맺을 때 1.5배 가중치로 감점합니다.
          - **(의도적 분리):** **'화성(Mars)'은 '성취운'의 '활동'과 혼동되므로, 건강운 점수 계산에서는 Mars의 영향을 의도적으로 배제하거나 최소화합니다.** (AI는 Mars가 아닌 Sun, Venus, Jupiter, Saturn을 중심으로 건강운을 판단해야 합니다.)
          - **(달의 영향):** 트랜싯 달은 '일시적인 컨디션 난조'나 '기분'을 의미하며, 점수에 소폭의 변동성만 줍니다.

      - 성취운: (규칙 전면 재조정: '높은 성취' 조건 강화)
        - **(핵심 정의):** '성취'는 '긍정적인 사회적 결과'입니다. '성과 없는 바쁨'은 명백한 감점 요인입니다.
       \s
        - **(1순위 - 'Veto' 감점 규칙):** AI는 점수 계산 전 **이 규칙을 최우선으로 확인합니다.** 만약 오늘 **트랜싯 화성(Mars) 또는 트랜싯 토성(Saturn)**이 `Natal 태양, Natal 화성, 또는 MC`와 **부정적 어스펙트(Square, Opposition)**를 맺는다면, 이는 **'성과를 직접적으로 방해'**하는 신호입니다.\s
            - 이 경우, **다른 긍정적 신호(예: 목성, 금성)가 있더라도, 이 부정적 신호가 점수 계산을 '지배(dominate)'합니다.** - 이 Veto 신호는 다른 긍정 요소를 **대부분 상쇄(offset)시키며**, 성취운 점수가 '보통'(125점) 이하가 되도록 **아주 강력하게 감점**합니다.
       \s
        - **(2순위 - '높은 성과' 가점 / 조건 강화):** '매우 높은' 성취(예: 190점 이상)는 **'결정적인 긍정 신호'**가 있을 때만 발생합니다.
            - 이는 **트랜싯 목성(Jupiter) 또는 트랜싯 태양(Sun)**이 `Natal 태양, MC`와 **매우 정확한(exact) 긍정 어스펙트(Trine, Sextile)**를 맺고, **동시에 1순위 Veto 감점 요인이 없을 때**만 해당됩니다.
       \s
        - **(3순위 - '일반 성과' 가점 / 화성 격하):** `트랜싯 화성(Mars)`의 **긍정적 어스펙트(Trine, Sextile)**는 '순조로운 업무'나 '추진력'을 의미하지만, 그 자체만으로는 '높은 성과'를 만들지 못합니다.
            - 이는 점수를 '보통' 이상(예: 140~170점)으로 올려주는 **'보조 가점'** 요인으로만 사용합니다. (1순위 Veto 감점 요인이 없을 때)
       \s
        - **(4순위 - 영향 제한):**
            - **달(Moon):** '일일 기분'일 뿐 '성과'가 아니므로, 점수에 소폭의 변동성(±10~20점)만 담당합니다.

      - 총운세: 긍/부정 어스펙트의 개수·강도 종합. (위의 1.5배 감점 가중치 및 달 가중치 룰을 동일하게 적용)
            
            **[매우 중요] 요약 작성 가이드라인 (detailed_summaries)**
                   \s
                    - `total_summary`와 `detailed_summaries`의 모든 내용은 **점성술을 전혀 모르는 일반인 사용자**를 위한 것입니다.
                    - 따라서, 요약 내용에는 **절대로** 다음과 같은 점성술 전문 용어를 사용하지 마세요:
                      - **행성 이름** (예: 금성, 화성, Jupiter, Venus)
                      - **어스펙트 이름** (예: Trine, Square, Opposition, 어스펙트)
                      - **하우스** (예: 5하우스, 10하우스)
                      - **기타 전문 용어** (예: Natal, Transit, 상승점, 중천점)
                   \s
                    - 점성술 데이터를 **"해석"**하여, 실제 생활과 밀접한 조언으로 풀어서 설명해야 합니다.
                   \s
                    - **(절대 금지 - 나쁜 예):** "Venus가 Natal Mars와 Square 어스펙트를 맺어 연애운이 나쁩니다."
                    - **(권장 - 좋은 예):** "오늘은 연인과 사소한 오해가 생기기 쉬운 날입니다. 말을 한 번 더 생각하고 부드럽게 표현하려는 노력이 필요합니다."
                   \s
                    - **(절대 금지 - 나쁜 예):** "Jupiter와 Sun의 Trine으로 금전운이 좋습니다."
                    - **(권장 - 좋은 예):** "금전적인 흐름이 매우 좋습니다. 예상치 못한 수입을 기대하거나, 계획했던 투자를 실행하기에 좋은 날입니다."
        
        아래 규칙을 마지막으로 한 번 더 상기:
        - **JSON만 출력**, 따옴표로 감싸지 말 것, 코드블록(````), 주석, 추가 텍스트 금지.
        """;

    @PostConstruct
    private void initializeRestClient() {
        this.restClient = RestClient.builder()
                .baseUrl(gmsBaseUrl)
                .defaultHeaders(headers -> {
                    headers.setBearerAuth(gmsApiKey);
                    headers.set("Content-Type", "application/json");
                })
                .build();
    }
    @Cacheable(
            value = "fortuneCache",
            key = "#root.methodName + ':' + #input.birthDate + 'T' + #input.birthTime + '::' + #city",
            cacheManager = "cacheManager"
    )
    public FinalFortuneResponse getFortuneScores(BirthDataInput input, String city) {
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
              "temperature": 0.7,
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
            if (aspectType.contains("Trine")) {
                mood = "[매우 긍정적/조화]";
            } else if (aspectType.contains("Sextile")) {
                mood = "[긍정적/기회]";
            } else if (aspectType.contains("Square")) {
                mood = "[부정적/긴장]";
            } else if (aspectType.contains("Opposition")) {
                mood = "[부정적/대립]";
            }

            sb.append(String.format("* %s %s (Transit)이 %s (Natal)과 %s (오차: %.1f°)\n",
                    mood, aspect.transitPlanet(), aspect.natalPlanet(), aspect.aspectType(), aspect.orb()));
        }
        return sb.toString().trim();
    }

    private String formatNatalPlanets(List<NatalPlanetInfo> planets) {
        StringBuilder sb = new StringBuilder();
        for (NatalPlanetInfo planet : planets) {
            sb.append(String.format("* %s: %s (%d 하우스)\n",
                    planet.name(), planet.sign(), planet.house()));
        }
        return sb.toString().trim();
    }

    private FortuneType determineFortuneType(FortuneScoreResponse scores) {
        int wealth = scores.money();
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

        String name;
        if ("wealth".equals(maxKey) && "romance".equals(minKey)) {
            name = "소";
        }
        else if ("wealth".equals(maxKey) && "achievement".equals(minKey)) {
            name = "쥐";
        }
        else if ("wealth".equals(maxKey) && "health".equals(minKey)) {
            name = "용";
        }
        else if ("romance".equals(maxKey) && "wealth".equals(minKey)) {
            name = "토끼";
        }
        else if ("romance".equals(maxKey) && "achievement".equals(minKey)) {
            name = "양";
        }
        else if ("romance".equals(maxKey) && "health".equals(minKey)) {
            name = "고양이";
        }
        else if ("achievement".equals(maxKey) && "wealth".equals(minKey)) {
            name = "호랑이";
        }
        else if ("achievement".equals(maxKey) && "romance".equals(minKey)) {
            name = "말";
        }
        else if ("achievement".equals(maxKey) && "health".equals(minKey)) {
            name = "닭";
        }
        else if ("health".equals(maxKey) && "wealth".equals(minKey)) {
            name = "개";
        }
        else if ("health".equals(maxKey) && "romance".equals(minKey)) {
            name = "뱀";
        }
        else {
            name = "원숭이";
        }

        return fortuneTypeRepository.findFortuneTypeByName(name)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 운세 타입 이름이 없습니다."));
    }
}
