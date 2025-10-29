package com.ssafy.agzak.domain.ranking.dto.request;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record SnapshotRankingQuery(
        LocalDate date,
        Integer limit
) {}
