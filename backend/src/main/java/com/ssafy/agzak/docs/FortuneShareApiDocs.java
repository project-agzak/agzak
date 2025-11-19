package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.fortune.dto.response.FinalFortuneResponse;
import com.ssafy.agzak.domain.share.dto.response.ShareLinkResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "운세 공유", description = "오늘 운세 공유(딥링크) API")
public interface FortuneShareApiDocs {

    @Operation(
            summary = "오늘 운세 공유 링크 발급",
            description = """
                    인증된 회원의 오늘 운세를 24시간 동안 열람 가능한 딥링크(URL)로 발급합니다.
                    - 토큰에는 memberId와 날짜가 서명되어 포함됩니다.
                    - 만료 시 재발급 필요합니다.
                    """,
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(
                            schema = @Schema(implementation = ShareLinkResponse.class),
                            examples = @ExampleObject(
                                    name = "발급 결과",
                                    value = """
                                    {
                                      "url": "https://agzak.app/share/fortune/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
                                      "expiresAtMillis": 1763074800000
                                    }
                                    """
                            )
                    ))
    })
    ResponseEntity<ShareLinkResponse> issueShareUrl();

    @Operation(
            summary = "공유 토큰으로 운세 조회(공개)",
            description = """
                    공유 링크의 토큰을 검증하여 해당 회원의 '토큰에 내장된 날짜' 운세를 반환합니다.
                    - 저장된 운세가 없으면 404(Not Found)입니다. (공개 조회에서는 운세 생성/계산을 수행하지 않습니다)
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = FinalFortuneResponse.class),
                            examples = @ExampleObject(
                                    name = "운세 조회 결과",
                                    value = """
                                    {
                                      "scores": {
                                        "total_score": 689,
                                        "love": 172,
                                        "health": 134,
                                        "money": 184,
                                        "achievement": 199,
                                        "total_summary": "오늘은 긍정적인 어스펙트들이 주로 작용...",
                                        "detailed_summaries": {
                                          "love": "연애운 설명...",
                                          "health": "건강운 설명...",
                                          "money": "금전운 설명...",
                                          "achievement": "성취운 설명..."
                                        }
                                      },
                                      "type": {
                                        "id": 9,
                                        "name": "닭",
                                        "goodWithId": 12,
                                        "badWithId": 1
                                      }
                                    }
                                    """
                            ))),
            @ApiResponse(responseCode = "400", description = "잘못된/만료된 토큰",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = """
                                    {
                                      "status": 400,
                                      "code": "BAD_REQUEST",
                                      "message": "유효하지 않은 공유 토큰입니다.",
                                      "path": "/api/v1/fortune/share/<token>"
                                    }
                                    """
                            ))),
            @ApiResponse(responseCode = "404", description = "운세 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject(
                                    value = """
                                    {
                                      "status": 404,
                                      "code": "NOT_FOUND",
                                      "message": "해당 멤버의 해당 날짜의 운세가 존재하지 않습니다. memberId=123, date=2025-11-14",
                                      "path": "/api/v1/fortune/share/<token>"
                                    }
                                    """
                            )))
    })
    ResponseEntity<FinalFortuneResponse> resolveShare(
            @Parameter(name = "token", in = ParameterIn.PATH, required = true, example = "eyJhbGciOiJIUzI1NiIs...")
            @PathVariable String token
    );
}
