package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

public interface FortuneCookieApiDocs {

    @Operation(
            summary = "쿠키 상세 조회",
            description = "특정 쿠키 상세 조회"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "쿠키 조회 성공",
                    content = @Content(schema = @Schema(implementation = CookieResponse.class))),
    })
    public ResponseEntity<CookieResponse> getCookieInfo(@PathVariable Long cookieId);
}
