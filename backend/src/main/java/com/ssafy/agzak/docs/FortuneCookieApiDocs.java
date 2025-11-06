package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "포춘 쿠키", description = "운세 강화, 포춘 쿠키 관련 API")
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

    @Operation(
            summary = "쿠키 상세 조회",
            description = "특정 쿠키 상세 조회"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "쿠키 사용 성공"),
            @ApiResponse(responseCode = "404", description = "오늘 조회한 운세 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> useCookie(@PathVariable Long cookieId);


    @Operation(
            summary = "보유 쿠키 목록 조회",
            description = """
        사용자가 보유한 쿠키 목록을 조회합니다.
        <br><br>
        <b>정렬 기준(sortType):</b><br>
        • <code>recent</code> : 최신순 (기본값)<br>
        • <code>score</code> : 운세 총점 높은 순<br>
        • <code>category</code> : 카테고리명 가나다순<br>
        """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = CookieResponse.class))
                    )
            ),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<List<CookieResponse>> getInventory(@RequestParam(defaultValue = "recent") String sortType);
}
