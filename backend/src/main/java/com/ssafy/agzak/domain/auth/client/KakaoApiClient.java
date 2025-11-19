package com.ssafy.agzak.domain.auth.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class KakaoApiClient {
    private final RestClient rest = RestClient.builder()
            .baseUrl("https://kapi.kakao.com")
            .build();

    public KakaoUserMeResponse getUserMe(String accessToken) {
        return rest.get()
                .uri("/v2/user/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(KakaoUserMeResponse.class);
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KakaoUserMeResponse {
        private Long id;
        private KakaoAccount kakao_account;
        private Properties properties;

        @Data @JsonIgnoreProperties(ignoreUnknown = true)
        public static class KakaoAccount {
            private Boolean email_needs_agreement;
            private String email;
            private Profile profile;
            @Data @JsonIgnoreProperties(ignoreUnknown = true)
            public static class Profile {
                private String nickname;
            }
        }

        @Data @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Properties {
            private String nickname;
        }

        public String email() {
            return kakao_account != null ? kakao_account.getEmail() : null;
        }
        public String nickname() {
            if (kakao_account != null && kakao_account.getProfile() != null && kakao_account.getProfile().getNickname() != null)
                return kakao_account.getProfile().getNickname();
            if (properties != null) return properties.getNickname();
            return null;
        }
    }
}