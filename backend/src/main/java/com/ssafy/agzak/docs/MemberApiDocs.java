package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.fortune.dto.response.DetailFortuneDataResponse;
import com.ssafy.agzak.domain.member.dto.request.MemberEditRequest;
import com.ssafy.agzak.domain.member.dto.response.MemberGraphResponse;
import com.ssafy.agzak.domain.member.dto.response.MemberInfoResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "회원", description = "회원 관련 API")
public interface MemberApiDocs {

    @Operation(
            summary = "회원 정보 조회",
            description = "현재 로그인한 회원의 상세 정보를 반환합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "회원 조회 완료",
                    content = @Content(schema = @Schema(implementation = MemberInfoResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 필요",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<MemberInfoResponse> getMemberInfo();

    @Operation(
            summary = "멤버 운세 상세 조회",
            description = "특정 날짜의 상세 운세를 조회합니다. 이미 해당 날짜에 운세가 생성되어 있어야 합니다."
    )
    @Parameter(name = "date",
            description = "조회할 날짜(ISO-8601, 예: 2025-11-05)",
            required = true,
            schema = @Schema(type = "string", format = "date", example = "2025-11-05"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "운세 조회 완료",
                    content = @Content(schema = @Schema(implementation = DetailFortuneDataResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 필요",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 날짜의 운세 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청(형식 오류 등)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<DetailFortuneDataResponse> getDetailData(@PathVariable LocalDate date);

    @Operation(
            summary = "운세 그래프 조회",
            description = "특정 기간(startDate ~ endDate)의 일별 운세 점수를 조회합니다. 기간은 양 끝을 포함합니다."
    )
    @Parameter(name = "startDate",
            description = "조회 시작일(ISO-8601, 예: 2025-11-01)",
            required = true,
            schema = @Schema(type = "string", format = "date", example = "2025-11-01"))
    @Parameter(name = "endDate",
            description = "조회 종료일(ISO-8601, 예: 2025-11-05)",
            required = true,
            schema = @Schema(type = "string", format = "date", example = "2025-11-05"))
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "그래프 데이터 조회 완료",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = MemberGraphResponse.class)))
            ),
            @ApiResponse(responseCode = "401", description = "인증 필요",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청(형식 오류 등)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<List<MemberGraphResponse>> getGraphs(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    );

    @Operation(
            summary = "회원 정보 수정",
            description = """
                닉네임 및 출생시각을 수정합니다.
                - 닉네임은 ACTIVE 회원 중 중복 불가
                - 출생시각은 `HH:mm:ss` 또는 `HH:mm` 형식(ISO LocalTime)
                """,
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = MemberEditRequest.class),
                            examples = @ExampleObject(
                                    name = "요청 예시",
                                    value = """
                                    {
                                      "nickname": "아그작유저",
                                      "birthTime": "07:30"
                                    }
                                    """
                            )
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 완료"),
            @ApiResponse(responseCode = "401", description = "인증 필요",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "닉네임 중복",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청(형식 오류 등)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> editMemberInfo(@RequestBody MemberEditRequest request);

    @Operation(
            summary = "회원 탈퇴",
            description = """
                회원 상태를 WITHDRAWN으로 전환하고, 해당 회원의 모든 소셜 연동 및 리프레시 토큰을 정리합니다.
                이후 토큰은 더 이상 유효하게 취급되지 않습니다.
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "탈퇴 완료"),
            @ApiResponse(responseCode = "401", description = "인증 필요",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> deleteMember();
}
