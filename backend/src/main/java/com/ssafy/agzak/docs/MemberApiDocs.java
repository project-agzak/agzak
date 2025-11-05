package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.fortune.dto.response.DetailFortuneDataResponse;
import com.ssafy.agzak.domain.member.dto.request.MemberEditRequest;
import com.ssafy.agzak.domain.member.dto.response.MemberGraphResponse;
import com.ssafy.agzak.domain.member.dto.response.MemberInfoResponse;
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
            summary = "회원 정보 조회",
            description = "회원 상세 정보 조회"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "회원 조회 완료",
                    content = @Content(schema = @Schema(implementation = MemberInfoResponse.class))),
    })
    public ResponseEntity<MemberInfoResponse> getMemberInfo();

    @Operation(
            summary = "멤버 운세 확인",
            description = "기존에 조회한 운세 확인"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "운세 조회 완료",
                    content = @Content(schema = @Schema(implementation = DetailFortuneDataResponse.class),
                    examples = @ExampleObject(
                            name = "기존 운세 & 강화된 운세 모두 조회",
                            value = """
                                    {
                                        "fortuneId": 5,
                                        "description": "오늘은 전체적으로 긍정적인 어스펙트가 많아 여러 면에서 유리하지만, 일부 부정적인 영향도 있어 주의가 필요합니다.",
                                        "totalScore": 722,
                                        "originalTotalScore": 722,
                                        "fortuneType": {
                                            "id": 7,
                                            "name": "호랑이",
                                            "goodWithId": 2,
                                            "badWithId": 11
                                        },
                                        "fortuneAspects": [
                                            {
                                                "name": "achievement",
                                                "score": 217,
                                                "original": 217
                                            },
                                            {
                                                "name": "health",
                                                "score": 175,
                                                "original": 175
                                            },
                                            {
                                                "name": "love",
                                                "score": 180,
                                                "original": 180
                                            },
                                            {
                                                "name": "money",
                                                "score": 150,
                                                "original": 150
                                            }
                                        ]
                                    }
                                    """
                    ))),
            @ApiResponse(responseCode = "404", description = "운세 조회 실패",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    })
    ResponseEntity<DetailFortuneDataResponse> getDetailData(@PathVariable LocalDate date);


    @Operation(
            summary = "운세 그래프 조회",
            description = "특정 기간 동안 운세 그래프 조회"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "운세 조회 완료",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = MemberGraphResponse.class)),
                    examples = @ExampleObject(
                            name =  "시작날짜 ~ 끝나는 날짜 점수 조회",
                            value = """
                                    [
                                        {
                                            "date": "2025-10-31",
                                            "originalScore": 0,
                                            "totalScore": 0
                                        },
                                        {
                                            "date": "2025-11-01",
                                            "originalScore": 0,
                                            "totalScore": 0
                                        },
                                        {
                                            "date": "2025-11-02",
                                            "originalScore": 0,
                                            "totalScore": 0
                                        },
                                        {
                                            "date": "2025-11-03",
                                            "originalScore": 0,
                                            "totalScore": 0
                                        },
                                        {
                                            "date": "2025-11-04",
                                            "originalScore": 601,
                                            "totalScore": 601
                                        },
                                        {
                                            "date": "2025-11-05",
                                            "originalScore": 750,
                                            "totalScore": 750
                                        }
                                    ]
                                    """
                    ))
            )
    })
    ResponseEntity<List<MemberGraphResponse>> getGraphs(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate);

    @Operation(
            summary = "회원 정보 수정",
            description = """
                            회원의 정보를 부분 수정합니다.
                            PATCH 요청이므로, 전달된 필드만 수정됩니다.
                            예시 요청 본문:
                            {
                              "nickname": "새로운닉네임",
                              "birthTime": "11:00"
                            }
                            위 두 항목 중 하나만 포함되어도 됩니다.
                            {
                              "nickname": "새로운닉네임"
                            } 
                            혹은
                            {
                              "birthTime": "11:00"
                            }
                        """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "변경 완료"
            ),
            @ApiResponse(responseCode = "409", description = "닉네임 중복",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    })
    ResponseEntity<Void> editMemberInfo(@RequestBody MemberEditRequest request);


    @Operation(
            summary = "회원 탈퇴",
            description = "회원 탈퇴"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "탈퇴 완료"
            )
    })
    ResponseEntity<Void> deleteMember();
}
