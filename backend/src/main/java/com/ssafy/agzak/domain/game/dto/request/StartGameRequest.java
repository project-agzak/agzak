package com.ssafy.agzak.domain.game.dto.request;

import java.time.LocalDate;

public record StartGameRequest(
        Long memberId,
        Integer sessionNo,
        LocalDate gameDate
) {}
