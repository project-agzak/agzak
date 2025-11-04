package com.ssafy.agzak.domain.fortune.service;

import com.ssafy.agzak.domain.fortune.dto.response.KakaoAddressResponse;
import com.ssafy.agzak.domain.fortune.exception.IllegalCityNameException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
@Slf4j
public class GeocodingService {

    @Value("${spring.kakao.map.api.key}")
    private String kakaoMapKey;

    private static final String KAKAO_MAP_API_URL = "https://dapi.kakao.com/v2/local/search/address.json";

    public KakaoAddressResponse.Document getCoordinates(String city) {
        //도시를 위도 경도로 변환
        RestClient restClient = RestClient.create();

        URI uri = UriComponentsBuilder.fromUriString(KAKAO_MAP_API_URL)
                .queryParam("query", city)
                .build()
                .toUri();

        KakaoAddressResponse response = restClient.get()
                .uri(uri)
                .header("Authorization", "KakaoAK " + kakaoMapKey)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (status,res) -> {
                    int code = res.getStatusCode().value();

                    if (code == 500) {
                        throw new IllegalCityNameException("해당 도시명을 찾을 수 없습니다.(영문 입력 또는 미등록 지역)", city);
                    }
                })
                .body(KakaoAddressResponse.class);

        if (response == null || response.documents() == null || response.documents().isEmpty()) {
            throw new IllegalCityNameException("해당 도시명을 찾을 수 없습니다.(영문 입력 또는 미등록 지역)", city);
        }

        return response.documents().get(0);
    }
}
