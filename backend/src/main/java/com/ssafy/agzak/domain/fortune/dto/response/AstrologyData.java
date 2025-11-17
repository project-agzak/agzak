package com.ssafy.agzak.domain.fortune.dto.response;

import java.util.List;

//SwissEphDataService에서 Swiss라이브러리에서 추출한 데이터 전달 DTO
public record AstrologyData(
        List<NatalPlanetInfo> natalPlanets,
        List<TransitPlanetInfo> transitPlanets,
        List<AspectInfo> aspects,
        double mcLongitude
) {}