package com.ssafy.agzak.domain.game.dto.request;

public record ClaimRequest(String type, String proof, String idempotencyKey) { }
