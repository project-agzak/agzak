package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.collection.dto.response.CollectionItemResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "쿠키 도감", description = "회원 도감 초기화/조회 API")
public interface CollectionApiDocs {

    @Operation(
            summary = "내 쿠키 도감 조회",
            description = """
                인증된 회원의 도감 목록을 반환합니다.
                서버는 토큰의 memberId를 사용합니다.
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = CollectionItemResponse.class)),
                            examples = @ExampleObject("""
                                [
                                  {
                                    "code": "MONEY",
                                    "name": "금전 쿠키",
                                    "rarityCode": "RARE",
                                    "recipe": "금전운이 가장 높고 ...",
                                    "message": "성공적으로 금전 쿠키가 구워졌습니다!",
                                    "count": 3,
                                    "obtainedAt": "2025-11-01T10:22:33"
                                  }
                                ]
                                """))),
            @ApiResponse(responseCode = "404", description = "회원 없음(인증 정보 불일치 등)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<List<CollectionItemResponse>> myCollection();

    @Operation(
            summary = "멤버 도감 조회(멤버 ID 또는 닉네임)",
            description = """
                쿼리 파라미터로 멤버 ID 또는 닉네임 중 하나로 도감을 조회합니다.
                둘 다 전달 시 **memberId가 우선** 적용됩니다.
                둘 다 비었으면 400(Bad Request)을 반환합니다.
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = CollectionItemResponse.class)))),
            @ApiResponse(responseCode = "400", description = "memberId와 nickname이 모두 누락됨",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "대상 멤버 없음(비활성/삭제 포함)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<List<CollectionItemResponse>> collectionByMember(
            @Parameter(description = "대상 멤버 ID. 제공 시 nickname보다 우선")
            @RequestParam(required = false) @Min(1) Long memberId,
            @Parameter(description = "대상 멤버 닉네임")
            @RequestParam(required = false) String nickname
    );
}