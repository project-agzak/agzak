package com.ssafy.agzak.domain.ranking.dto.response;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record TodayRankingResponse(
        LocalDate date,
        List<RankingItemResponse> totalLeaderboard,     // 총점 기준 TOP N
        List<RankingItemResponse> originalLeaderboard,  // 기존점수 기준 TOP N
        List<RankingItemResponse> increaseLeaderboard   // 증가율 기준 TOP N
) {}
