package com.ssafy.agzak.domain.ranking.dto;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record RankingListDto(
        LocalDate date,
        List<RankingItemDto> totalLeaderboard,     // 총점 TOP N
        List<RankingItemDto> originalLeaderboard,  // 초기점수 TOP N
        List<RankingItemDto> increaseLeaderboard   // 증가율 TOP N
) {}