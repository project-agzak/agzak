package com.ssafy.agzak.domain.fortune.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.response.FinalFortuneResponse;
import com.ssafy.agzak.domain.fortune.dto.response.FortuneScoreResponse;
import com.ssafy.agzak.domain.fortune.dto.response.FortuneTypeResponse;
import com.ssafy.agzak.domain.fortune.dto.response.ScoreCalculationResult;
import com.ssafy.agzak.domain.fortune.entity.FortuneType;
import com.ssafy.agzak.domain.fortune.repository.FortuneTypeRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FortuneAiService {

    private RestClient restClient;
    private final AstrologyCalculationService calculationService;
    private final FortuneTypeRepository fortuneTypeRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${fastapi.gateway.url}")
    private String fastapiGatewayUrl;

    @PostConstruct
    private void initializeRestClient() {
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();

        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .baseUrl(fastapiGatewayUrl)
                .defaultHeaders(headers -> {
                    headers.set("Content-Type", "application/json");
                })
                .build();
    }

    @Retryable(
            value = {IllegalStateException.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000)
    )
    public FinalFortuneResponse getFortuneScores(BirthDataInput input, String city) {

        log.info("Java 엔진: 점수 계산 시작");
        ScoreCalculationResult calculationResult = calculationService.calculateScores(input);
        log.info("Java 엔진: 점수 {}", calculationResult.getScores());
        log.info("Java 엔진: 점수 계산 완료. 핵심 근거: {}", calculationResult.getScores());
        log.info("FastAPI 게이트웨이: 요약 요청 전송");
        FortuneScoreResponse scores;
        try {
            String jsonRequestBody = objectMapper.writeValueAsString(calculationResult);
//            log.info("FastAPI 게이트웨이: 전송할 Body(JSON): {}", jsonRequestBody);
            scores = restClient.post()
                    .uri("/summarize")
                    .body(calculationResult)
                    .retrieve()
                    .body(FortuneScoreResponse.class);
            if (scores == null) {
                throw new IllegalStateException("FastAPI response body is null");
            }
            log.info("FastAPI 게이트웨이: 요약 수신 완료.");

        } catch (Exception e) {
            log.error("FastAPI 게이트웨이 호출 실패: {}", e.getMessage());
            throw new IllegalStateException("AI 요약 서비스 호출에 실패했습니다.", e);
        }

        log.info("Java 엔진: 운세 타입 결정 시작...");
        FortuneType fortuneType = determineFortuneType(scores);
        log.info("Java 엔진: 운세 타입 결정 완료. 타입: {}", fortuneType.getName());

        return new FinalFortuneResponse(scores, FortuneTypeResponse.fromEntity(fortuneType));
    }

    @Recover
    public FinalFortuneResponse recover(IllegalStateException e, BirthDataInput input, String city) {
        log.error("AI 운세 생성 최종 실패 (3회 재시도 모두 실패): {}", e.getMessage());
        throw new IllegalStateException("운세 생성 서비스에 일시적인 문제가 발생했습니다.", e);
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
        String maxKey = Collections.max(scoreMap.entrySet(), Map.Entry.comparingByValue()).getKey();
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