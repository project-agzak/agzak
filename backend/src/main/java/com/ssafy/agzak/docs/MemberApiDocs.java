package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.fortune.dto.response.DetailFortuneDataResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDate;

@Tag(name = "회원", description = "회원 관련 API")
public interface MemberApiDocs {

    @Operation(
            summary = "멤버 운세 확인",
            description = "기존에 조회한 운세 확인"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "운세 조회 완료",
                    content = @Content(schema = @Schema(implementation = DetailFortuneDataResponse.class))),
            @ApiResponse(responseCode = "404", description = "운세 조회 실패",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    })
    public ResponseEntity<DetailFortuneDataResponse> getDetailData(@PathVariable LocalDate date);
}
