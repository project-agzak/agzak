package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.fortune.dto.request.GuestFortuneRequest;
import com.ssafy.agzak.domain.fortune.dto.response.FinalFortuneResponse;
import com.ssafy.agzak.domain.fortune.dto.response.FortuneTypeResponse;
import com.ssafy.agzak.domain.fortune.dto.response.GuestFortuneWithIdResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "운세 확인", description = "운세 확인 API")
public interface FortuneApiDocs {

    @Operation(
            summary = "회원 오늘의 운세 생성/조회",
            description = "인증된 회원의 오늘 운세를 계산해 저장 후 반환합니다.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = FinalFortuneResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 필요",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<FinalFortuneResponse> postMemberTodayFortune();

    @Operation(
            summary = "게스트 운세 조회",
            description = "가입 없이 입력한 출생정보로 운세 계산 후 guestId를 발급합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = GuestFortuneWithIdResponse.class))),
            @ApiResponse(responseCode = "400", description = "도시 입력 오류/좌표 변환 실패",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<GuestFortuneWithIdResponse> postGuestFortune(@RequestBody GuestFortuneRequest guestFortuneRequest);

    @Operation(
            summary = "운세 타입 상세 조회",
            description = "운세 카드(동물/설명) 상세 정보 조회",
            parameters = @Parameter(name = "fortuneTypeId", in = ParameterIn.PATH, required = true, example = "1")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = FortuneTypeResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 운세 타입 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<FortuneTypeResponse> getFortuneTypeDetail(@PathVariable Long fortuneTypeId);
}
