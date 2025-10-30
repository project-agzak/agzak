package com.ssafy.agzak.domain.fortune.dto.response;

// 출생 차트(Natal) 행성 위치 정보
public record NatalPlanetInfo(
        String name,      // 행성 이름 (예: Sun)
        String sign,      // 별자리 및 도수 (예: Taurus 15.3°)
        double longitude, // 실제 경도 (계산용)
        int house         // 위치한 하우스 (예: 7)
) {
}
