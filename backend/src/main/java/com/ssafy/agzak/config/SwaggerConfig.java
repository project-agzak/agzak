package com.ssafy.agzak.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@SecurityScheme(
        name = "BearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class SwaggerConfig {
    public static final String ACCESS = "BearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .servers(List.of(
                        // 로컬: 직접 호출용
                        new Server()
                                .url("http://localhost:8082")
                                .description("Local Backend ( http://localhost:8082 )")
                ))
                .info(new Info().title("Agzak API").version("v1"))
                .addSecurityItem(new SecurityRequirement().addList(ACCESS));
    }
}
