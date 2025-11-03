package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.fortune.dto.request.GuestFortuneRequest;
import com.ssafy.agzak.domain.fortune.dto.response.FinalFortuneResponse;
import com.ssafy.agzak.domain.fortune.dto.response.FortuneScoreResponse;
import com.ssafy.agzak.domain.fortune.dto.response.FortuneTypeResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "운세 확인", description = "운세 확인 API")
public interface FortuneApiDocs {

    @Operation(
            summary = "회원 운세 확인",
            description = "가입된 회원의 오늘의 운세 조회"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "운세 생성 완료",
                    content = @Content(schema = @Schema(implementation = FortuneScoreResponse.class)))
    })
    ResponseEntity<FinalFortuneResponse> postMemberTodayFortune();

    @Operation(
            summary = "게스트 운세 확인",
            description = "가입하지 않은 회원은 정보 입력 후 운세 확인"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "운세 생성 완료",
                    content = @Content(schema = @Schema(implementation = FortuneScoreResponse.class))),
            @ApiResponse(responseCode = "400", description = "도시 입력 오류",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    })
    ResponseEntity<FinalFortuneResponse> postGuestFortune(@RequestBody GuestFortuneRequest guestFortuneRequest);

    @Operation(
            summary = "운세 타입 상세 조회",
            description = "운세 카드 내용 상세 조회"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "운세 타입 조회 성공",
                    content = @Content(schema = @Schema(implementation = FortuneTypeResponse.class))),
            @ApiResponse(responseCode = "500", description = "운세 타입 조회 실패 유효하지 않은 아이디",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    })
    ResponseEntity<FortuneTypeResponse> getFortuneTypeDetail(@PathVariable Long fortuneTypeId);
}
