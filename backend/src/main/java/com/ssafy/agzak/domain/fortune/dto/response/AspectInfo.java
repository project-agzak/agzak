package com.ssafy.agzak.domain.fortune.dto.response;

//어스펙트 정보 (Natal vs Transit)
public record AspectInfo(
        String transitPlanet, // 현재 행성
        String aspectType,    // 어스펙트 타입 (예: Trine, Square)
        String natalPlanet,   // 출생 행성
        double orb            // 오차 범위
) {
}
