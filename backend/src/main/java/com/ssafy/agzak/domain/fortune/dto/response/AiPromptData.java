package com.ssafy.agzak.domain.fortune.dto.response;

import java.util.List;

public record AiPromptData(List<NatalPlanetInfo> natalPlanets,
                           List<TransitPlanetInfo> transitPlanets,
                           List<AspectInfo> aspects,
                           String ascendantSign,
                           String mcSign) {
}
