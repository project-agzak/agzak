package com.ssafy.agzak.domain.ranking.dto.request;

import lombok.Builder;

@Builder
public record TodayRankingQuery(
        Integer limit // 기본값은 컨트롤러에서 100 등으로 처리
) {}
