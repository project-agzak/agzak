package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.fortune.dto.response.DetailFortuneDataResponse;
import com.ssafy.agzak.domain.member.dto.request.MemberEditRequest;
import com.ssafy.agzak.domain.member.dto.response.MemberGraphResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

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


    @Operation(
            summary = "운세 그래프 조회",
            description = "특정 기간 동안 운세 그래프 조회"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "운세 조회 완료",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = MemberGraphResponse.class)))
            )
    })
    public ResponseEntity<List<MemberGraphResponse>> getGraphs(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate);

    @Operation(
            summary = "회원 정보 수정",
            description = "닉네임 수정",
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(schema = @Schema(implementation = MemberEditRequest.class),
                            examples = @ExampleObject(name="예시",
                                    value = """
                                    {
                                      "nickname": "아그작유저",
                                    }
                                    """)
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "변경 완료"
            ),
            @ApiResponse(responseCode = "409", description = "닉네임 중복",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    })
    public ResponseEntity<Void> editMemberInfo(@RequestBody MemberEditRequest request);
}
