package com.ssafy.agzak.domain.game.dto.response;

public record ClaimResponse(int cap, long used, int remaining, int maxCap, int unlockable, String message) { }
