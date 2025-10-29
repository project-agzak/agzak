package com.ssafy.agzak.domain.ranking.dto.response;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record SnapshotRankingResponse(
        LocalDate date,
        List<RankingItemResponse> leaderboard           // 스냅샷(총점 기준)
) {}
