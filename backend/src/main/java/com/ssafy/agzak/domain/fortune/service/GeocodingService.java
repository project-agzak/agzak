package com.ssafy.agzak.domain.fortune.service;

import com.ssafy.agzak.domain.fortune.dto.response.KakaoAddressResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
public class GeocodingService {

    @Value("${spring.kakao.map.api.key}")
    private String kakaoMapKey;

    private static final String KAKAO_MAP_API_URL = "https://dapi.kakao.com/v2/local/search/address.json";

    public KakaoAddressResponse.Document getCoordinates(String city) {
        //도시를 위도 경도로 변환
        RestClient restClient = RestClient.create();

        URI uri = UriComponentsBuilder.fromHttpUrl(KAKAO_MAP_API_URL)
                .queryParam("query", city)
                .build()
                .toUri();

        KakaoAddressResponse response = restClient.get()
                .uri(uri)
                .header("Authorization", "KakaoAK " + kakaoMapKey)
                .retrieve()
                .body(KakaoAddressResponse.class);

        return response.documents().get(0);
    }
}
