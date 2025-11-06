package com.ssafy.agzak.domain.fortune.service;

import com.ssafy.agzak.domain.fortune.dto.response.LatLng;
import com.ssafy.agzak.domain.fortune.exception.IllegalCityNameException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeocodingService {

    private final CityIndex cityIndex;

    public LatLng getCoordinates(String city) {
        //도시를 위도 경도로 변환
        return cityIndex.find(city)
                .map(Map.Entry::getValue)
                .orElseThrow(() ->
                        new IllegalCityNameException(
                                String.format("해당 도시명을 찾을 수 없습니다. (입력값: %s, 영문 입력 또는 미등록 지역)", city),
                                city
                        ));
    }
}
