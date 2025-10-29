package com.ssafy.agzak.domain.ranking.dto.response;

import lombok.Builder;

@Builder
public record RankingItemResponse(
        Long memberId,
        String nickname,
        Integer totalScore,           // 강화 후
        Integer originalTotalScore,   // 강화 전
        Integer totalRank,            // 총점 랭크(강화 후)
        Integer originalRank,         // 기존 총점 랭크(강화 전)
        Integer increaseRank,         // 증가율 랭크
        Double increasePercent        // (total - original)/max(1,original)*100.0
) {}
