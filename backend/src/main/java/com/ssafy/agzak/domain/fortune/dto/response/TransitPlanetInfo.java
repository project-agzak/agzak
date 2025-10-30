package com.ssafy.agzak.domain.fortune.dto.response;

//현재(Transit) 행성 위치 정보
public record TransitPlanetInfo(
        String name,      // 행성 이름
        String sign,      // 별자리 및 도수
        double longitude  // 실제 경도
) {
}
