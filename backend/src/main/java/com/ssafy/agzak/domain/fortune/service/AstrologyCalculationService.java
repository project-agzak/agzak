package com.ssafy.agzak.domain.fortune.service;


import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.response.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

//점수 계산
@Service
@RequiredArgsConstructor
public class AstrologyCalculationService {

    private final SwissEphDataService swissEphDataService;
    private static final int BASE_SCORE = 125;
    private static final int SCORE_MIN = 0;
    private static final int SCORE_MAX = 250;

    // 점수 가중치 (부정적 1.5배)
    private static final int WEIGHT_POSITIVE_MAJOR = 40; // 목성, 토성, 태양 등
    private static final int WEIGHT_NEGATIVE_MAJOR = -60; // (1.5x)

    private static final int WEIGHT_POSITIVE_MINOR = 25; // 금성, 화성, 수성
    private static final int WEIGHT_NEGATIVE_MINOR = -38; // (약 1.5x)

    // 달 가중치 (일일 변동성)
    private static final int WEIGHT_POSITIVE_MOON = 20; // 프롬프트: 40~50%의 변동성
    private static final int WEIGHT_NEGATIVE_MOON = -30; // (1.5x)

    // 어스펙트 이름 상수
    private static final String CONJUNCTION = "Conjunction";
    private static final String OPPOSITION = "Opposition";
    private static final String SQUARE = "Square";
    private static final String TRINE = "Trine";
    private static final String SEXTILE = "Sextile";

    private static final double MAX_ORB = 5.0;

    public ScoreCalculationResult calculateScores(BirthDataInput input) {

        AstrologyData data = swissEphDataService.getAstrologicalData(input);

        ScoreAndDriver achievementResult = calculateAchievementScore(data.natalPlanets(), data.aspects(), data.mcLongitude());
        ScoreAndDriver loveResult = calculateLoveScore(data.natalPlanets(), data.aspects());
        ScoreAndDriver healthResult = calculateHealthScore(data.natalPlanets(), data.aspects());
        ScoreAndDriver moneyResult = calculateMoneyScore(data.natalPlanets(), data.aspects());

        return new ScoreCalculationResult(
                Map.of(
                        "love", loveResult.score(),
                        "health", healthResult.score(),
                        "money", moneyResult.score(),
                        "achievement", achievementResult.score()
                ),
                Map.of(
                        "love", loveResult.driverKey(),
                        "health", healthResult.driverKey(),
                        "money", moneyResult.driverKey(),
                        "achievement", achievementResult.driverKey()
                )
        );
    }

    private record ScoreAndDriver(int score, String driverKey) {}

    private static class ScoringContext {
        int score = BASE_SCORE;
        String driverKey = "DEFAULT_POSITIVE";
        int priority = 100; // 낮을수록 높은 우선순위
        double scoreChange = 0.0;

        void applyScore(double points, String key, int keyPriority) {
            this.scoreChange += points;
            if (keyPriority < this.priority) {
                this.priority = keyPriority;
                this.driverKey = key;
            }
        }

        // 점수를 0~250 사이로 고정
        int getFinalScore() {
            int finalScore = BASE_SCORE + (int) Math.round(this.scoreChange);
            return Math.max(SCORE_MIN, Math.min(SCORE_MAX, finalScore));
        }
    }

    private double calculateWeightedScore(AspectInfo aspect, int baseWeight) {
        if (aspect == null) {
            return 0.0;
        }
        double orb = aspect.orb(); // 0.0 ~ 5.0

        // 선형 감소: 0도일 때 100%, 5도일 때 0%
        double weight = (MAX_ORB - orb) / MAX_ORB;

        return baseWeight * weight;
    }

    private NatalPlanetInfo findNatalPlanet(List<NatalPlanetInfo> natals, String name) {
        return natals.stream().filter(p -> p.name().equals(name)).findFirst().orElse(null);
    }

    private List<NatalPlanetInfo> getNatalPlanetsInHouse(List<NatalPlanetInfo> natals, int house) {
        return natals.stream().filter(p -> p.house() == house).toList();
    }

    // --- 4가지 핵심 점수 계산 로직 (Orb 가중치 적용) --
    private ScoreAndDriver calculateAchievementScore(List<NatalPlanetInfo> natals, List<AspectInfo> aspects, double mcLongitude) {
        ScoringContext ctx = new ScoringContext();

        // 1. 성취운 관련 Natal "행성" 정의
        List<NatalPlanetInfo> relevantNatals = new ArrayList<>();
        relevantNatals.add(findNatalPlanet(natals, "Sun"));
        relevantNatals.add(findNatalPlanet(natals, "Mars"));

        for (AspectInfo aspect : aspects) {
            String tName = aspect.transitPlanet();
            String nName = aspect.natalPlanet();

            boolean isRelevant = relevantNatals.stream().anyMatch(p -> p != null && p.name().equals(nName));
            if (!isRelevant) continue;

            int baseWeight = 0;
            String key = "";
            int priority = 100;

            // 2. 어스펙트 타입과 행성에 따라 가중치/키/우선순위 결정
            if (aspect.aspectType().contains(SQUARE) || aspect.aspectType().contains(OPPOSITION)) {
                // 1순위: Veto 감점 규칙
                if ((tName.equals("Mars") || tName.equals("Saturn"))) {
                    baseWeight = WEIGHT_NEGATIVE_MAJOR * 2;
                    key = "VETO_ACHIEVEMENT_HARD_ASPECT";
                    priority = 0; // 최우선 순위
                }
            } else if (aspect.aspectType().contains(TRINE) || aspect.aspectType().contains(SEXTILE)) {
                // 2순위: '높은 성과' 가점
                if (tName.equals("Jupiter") || tName.equals("Sun")) {
                    baseWeight = WEIGHT_POSITIVE_MAJOR;
                    key = "ACHIEVEMENT_MAJOR_POSITIVE";
                    priority = 5;
                }
                // 3순위: '일반 성과' 가점
                else if (tName.equals("Mars")) {
                    baseWeight = WEIGHT_POSITIVE_MINOR;
                    key = "ACHIEVEMENT_MARS_POSITIVE";
                    priority = 10;
                }
            }

            // 4순위: 달의 영향 (소폭)
            if (tName.equals("Moon")) {
                if (aspect.aspectType().contains("Positive")) {
                    baseWeight = WEIGHT_POSITIVE_MOON / 2; // 소폭
                    key = "ACHIEVEMENT_MOON_POSITIVE";
                    priority = 50;
                } else if (aspect.aspectType().contains("Negative")) {
                    baseWeight = WEIGHT_NEGATIVE_MOON / 2; // 소폭
                    key = "ACHIEVEMENT_MOON_NEGATIVE";
                    priority = 40;
                }
            }

            // 3. Orb 가중치를 적용한 실제 점수 계산
            if (baseWeight != 0) {
                double weightedScore = calculateWeightedScore(aspect, baseWeight);
                ctx.applyScore(weightedScore, key, priority);
            }
        }

        return new ScoreAndDriver(ctx.getFinalScore(), ctx.driverKey);
    }

    /**
     * 연애운 계산 로직 (Orb 가중치 적용 - 기준 템플릿)
     */
    private ScoreAndDriver calculateLoveScore(List<NatalPlanetInfo> natals, List<AspectInfo> aspects) {
        ScoringContext ctx = new ScoringContext();
        List<NatalPlanetInfo> relevantNatals = new ArrayList<>();
        relevantNatals.add(findNatalPlanet(natals, "Venus"));
        relevantNatals.add(findNatalPlanet(natals, "Mars"));
        relevantNatals.addAll(getNatalPlanetsInHouse(natals, 5));
        relevantNatals.addAll(getNatalPlanetsInHouse(natals, 7));

        for (AspectInfo aspect : aspects) {
            String tName = aspect.transitPlanet();
            String nName = aspect.natalPlanet();

            boolean isRelevant = relevantNatals.stream().anyMatch(p -> p != null && p.name().equals(nName));
            if (!isRelevant) continue;

            int baseWeight = 0;
            String key = "";
            int priority = 100;

            if (aspect.aspectType().contains(TRINE) || aspect.aspectType().contains(SEXTILE)) {
                // 긍정 어스펙트
                if (tName.equals("Jupiter")) { baseWeight = WEIGHT_POSITIVE_MAJOR; key = "LOVE_JUPITER_POSITIVE"; priority = 5; }
                else if (tName.equals("Venus")) { baseWeight = WEIGHT_POSITIVE_MINOR; key = "LOVE_VENUS_POSITIVE"; priority = 10; }
                else if (tName.equals("Mars")) { baseWeight = WEIGHT_POSITIVE_MINOR; key = "LOVE_MARS_POSITIVE"; priority = 10; }
                else if (tName.equals("Moon")) { baseWeight = WEIGHT_POSITIVE_MOON; key = "LOVE_MOON_POSITIVE"; priority = 20; }

            } else if (aspect.aspectType().contains(SQUARE) || aspect.aspectType().contains(OPPOSITION)) {
                // 부정 어스펙트
                if (tName.equals("Saturn")) { baseWeight = WEIGHT_NEGATIVE_MAJOR; key = "LOVE_SATURN_NEGATIVE"; priority = 5; }
                else if (tName.equals("Venus")) { baseWeight = WEIGHT_NEGATIVE_MINOR; key = "LOVE_VENUS_NEGATIVE"; priority = 15; }
                else if (tName.equals("Mars")) { baseWeight = WEIGHT_NEGATIVE_MINOR; key = "LOVE_MARS_NEGATIVE"; priority = 15; }
                else if (tName.equals("Moon")) { baseWeight = WEIGHT_NEGATIVE_MOON; key = "LOVE_MOON_NEGATIVE"; priority = 30; }
            }

            if (baseWeight != 0) {
                double weightedScore = calculateWeightedScore(aspect, baseWeight);
                ctx.applyScore(weightedScore, key, priority);
            }
        }

        return new ScoreAndDriver(ctx.getFinalScore(), ctx.driverKey);
    }

    private ScoreAndDriver calculateHealthScore(List<NatalPlanetInfo> natals, List<AspectInfo> aspects) {
        ScoringContext ctx = new ScoringContext();

        // 1. 건강운 관련 Natal 행성 정의
        List<NatalPlanetInfo> positiveNatals = List.of(findNatalPlanet(natals, "Sun"), findNatalPlanet(natals, "Jupiter"), findNatalPlanet(natals, "Venus"));
        List<NatalPlanetInfo> negativeNatals = new ArrayList<>();
        negativeNatals.add(findNatalPlanet(natals, "Saturn"));
        negativeNatals.addAll(getNatalPlanetsInHouse(natals, 6));

        for (AspectInfo aspect : aspects) {
            String tName = aspect.transitPlanet();
            String nName = aspect.natalPlanet();

            if (tName.equals("Mars") || nName.equals("Mars")) continue;

            int baseWeight = 0;
            String key = "";
            int priority = 100;

            // 2. 가점 요인 (Positive Natals)
            boolean isPosRelevant = positiveNatals.stream().anyMatch(p -> p != null && p.name().equals(nName));
            if (isPosRelevant && (aspect.aspectType().contains(TRINE) || aspect.aspectType().contains(SEXTILE))) {
                if (tName.equals("Jupiter") || tName.equals("Sun")) { baseWeight = WEIGHT_POSITIVE_MAJOR; key = "HEALTH_POSITIVE_MAJOR"; priority = 10; }
                else if (tName.equals("Venus")) { baseWeight = WEIGHT_POSITIVE_MINOR; key = "HEALTH_POSITIVE_MINOR"; priority = 15; }
            }

            // 3. 감점 요인 (Negative Natals)
            boolean isNegRelevant = negativeNatals.stream().anyMatch(p -> p != null && p.name().equals(nName));
            if (isNegRelevant && (aspect.aspectType().contains(SQUARE) || aspect.aspectType().contains(OPPOSITION) || aspect.aspectType().contains(CONJUNCTION))) {
                if (tName.equals("Saturn")) { baseWeight = WEIGHT_NEGATIVE_MAJOR; key = "HEALTH_SATURN_NEGATIVE"; priority = 5; }
                else { baseWeight = WEIGHT_NEGATIVE_MINOR; key = "HEALTH_NEGATIVE_MINOR"; priority = 15; }
            }

            // 4. 달의 영향 (소폭)
            if (tName.equals("Moon")) {
                if (aspect.aspectType().contains("Positive")) { baseWeight = WEIGHT_POSITIVE_MOON / 2; key = "HEALTH_MOON_POSITIVE"; priority = 50; }
                else if (aspect.aspectType().contains("Negative")) { baseWeight = WEIGHT_NEGATIVE_MOON / 2; key = "HEALTH_MOON_NEGATIVE"; priority = 40; }
            }

            if (baseWeight != 0) {
                double weightedScore = calculateWeightedScore(aspect, baseWeight);
                ctx.applyScore(weightedScore, key, priority);
            }
        }

        return new ScoreAndDriver(ctx.getFinalScore(), ctx.driverKey);
    }

    /**
     * 금전운 계산 로직 (Orb 가중치 적용)
     */
    private ScoreAndDriver calculateMoneyScore(List<NatalPlanetInfo> natals, List<AspectInfo> aspects) {
        ScoringContext ctx = new ScoringContext();
        List<NatalPlanetInfo> relevantNatals = new ArrayList<>();
        relevantNatals.add(findNatalPlanet(natals, "Venus"));
        relevantNatals.add(findNatalPlanet(natals, "Jupiter"));
        relevantNatals.addAll(getNatalPlanetsInHouse(natals, 2));
        relevantNatals.addAll(getNatalPlanetsInHouse(natals, 8));

        for (AspectInfo aspect : aspects) {
            String tName = aspect.transitPlanet();
            String nName = aspect.natalPlanet();

            boolean isRelevant = relevantNatals.stream().anyMatch(p -> p != null && p.name().equals(nName));
            if (!isRelevant) continue;

            int baseWeight = 0;
            String key = "";
            int priority = 100;

            if (aspect.aspectType().contains(TRINE) || aspect.aspectType().contains(SEXTILE)) {
                // 긍정 어스펙트
                if (tName.equals("Jupiter")) { baseWeight = WEIGHT_POSITIVE_MAJOR; key = "MONEY_JUPITER_POSITIVE"; priority = 10; }
                else if (tName.equals("Venus")) { baseWeight = WEIGHT_POSITIVE_MINOR; key = "MONEY_VENUS_POSITIVE"; priority = 15; }
                else if (tName.equals("Moon")) { baseWeight = WEIGHT_POSITIVE_MOON; key = "MONEY_MOON_POSITIVE"; priority = 20; }

            } else if (aspect.aspectType().contains(SQUARE) || aspect.aspectType().contains(OPPOSITION)) {
                // 부정 어스펙트
                if (tName.equals("Saturn")) { baseWeight = WEIGHT_NEGATIVE_MAJOR; key = "MONEY_SATURN_NEGATIVE"; priority = 5; }
                else if (tName.equals("Jupiter")) { baseWeight = WEIGHT_NEGATIVE_MAJOR; key = "MONEY_JUPITER_NEGATIVE"; priority = 15; }
                else if (tName.equals("Venus")) { baseWeight = WEIGHT_NEGATIVE_MINOR; key = "MONEY_VENUS_NEGATIVE"; priority = 20; }
                else if (tName.equals("Moon")) { baseWeight = WEIGHT_NEGATIVE_MOON; key = "MONEY_MOON_NEGATIVE"; priority = 30; }
            }

            if (baseWeight != 0) {
                double weightedScore = calculateWeightedScore(aspect, baseWeight);
                ctx.applyScore(weightedScore, key, priority);
            }
        }

        return new ScoreAndDriver(ctx.getFinalScore(), ctx.driverKey);
    }

}