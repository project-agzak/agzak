package com.ssafy.agzak.domain.fortune.dto.response;

public record FortuneTypeResponse(long id, String name, String description, long goodWithId, long badWithId) {
}
