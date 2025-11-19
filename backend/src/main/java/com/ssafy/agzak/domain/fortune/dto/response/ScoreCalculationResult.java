package com.ssafy.agzak.domain.fortune.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ScoreCalculationResult {
    private Map<String, Integer> scores;
    private Map<String, String> keyDrivers;
}
