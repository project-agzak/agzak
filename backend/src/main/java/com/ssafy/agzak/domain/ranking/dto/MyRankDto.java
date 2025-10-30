package com.ssafy.agzak.domain.ranking.dto;

import lombok.Builder;
import java.time.LocalDate;

@Builder
public record MyRankDto(
        LocalDate date,
        Long memberId,
        String nickname,
        Integer totalScore,
        Integer originalTotalScore,
        Double increasePercent,
        Integer totalRank,
        Integer originalRank,
        Integer increaseRank
) {}
