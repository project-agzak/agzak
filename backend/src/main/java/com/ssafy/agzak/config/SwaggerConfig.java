package com.ssafy.agzak.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {
    public static final String ACCESS = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server().url("/").description("http://localhost:8082/")
//                        new Server().url("/api/v1").description("https://k13b102.p.ssafy.io/api/")
                ))
                .info(new Info().title("Agzak API").version("v1"))
                .addSecurityItem(new SecurityRequirement().addList(ACCESS));
    }
}
