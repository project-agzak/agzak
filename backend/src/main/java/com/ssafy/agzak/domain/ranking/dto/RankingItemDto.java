package com.ssafy.agzak.domain.ranking.dto;

import lombok.Builder;

@Builder
public record RankingItemDto(
        Long memberId,
        String nickname,
        Integer totalScore,
        Integer originalTotalScore,
        Double increasePercent,
        Integer totalRank,       // 1-base 경쟁랭킹
        Integer originalRank,    // 1-base 경쟁랭킹
        Integer increaseRank     // 1-base 경쟁랭킹
) {}