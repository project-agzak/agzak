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
import org.springframework.http.ResponseEntity;

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
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = CollectionItemResponse.class)),
                            examples = @ExampleObject("""
                                [
                                  {
                                    "type": "CHOCO",
                                    "firstDescription": "진하고 달콤한 초코 쿠키",
                                    "count": 3,
                                    "obtainedAt": "2025-11-01T10:22:33"
                                  },
                                  {
                                    "type": "VANILLA",
                                    "firstDescription": "은은한 바닐라 향",
                                    "count": 1,
                                    "obtainedAt": "2025-11-02T09:00:00"
                                  }
                                ]
                                """)))
            ,
            @ApiResponse(
                    responseCode = "404",
                    description = "회원 없음(인증 정보 불일치 등)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject("""
                                { "code": "MEMBER_NOT_FOUND", "message": "회원이 존재하지 않습니다." }
                                """)))
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
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = CollectionItemResponse.class)),
                            examples = @ExampleObject("""
                                [
                                  {
                                    "type": "CHOCO",
                                    "firstDescription": "진하고 달콤한 초코 쿠키",
                                    "count": 5,
                                    "obtainedAt": "2025-10-28T12:00:00"
                                  }
                                ]
                                """)))
            ,
            @ApiResponse(
                    responseCode = "400",
                    description = "memberId와 nickname이 모두 누락됨",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject("""
                                { "code": "BAD_REQUEST", "message": "memberId 또는 nickname 중 하나는 필요합니다." }
                                """)))
            ,
            @ApiResponse(
                    responseCode = "404",
                    description = "대상 멤버 없음(비활성/삭제 포함)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject("""
                                { "code": "MEMBER_NOT_FOUND", "message": "대상 회원을 찾을 수 없습니다." }
                                """)))
    })
    ResponseEntity<List<CollectionItemResponse>> collectionByMember(
            @Parameter(description = "대상 멤버 ID. 제공 시 nickname보다 우선")
            Long memberId,
            @Parameter(description = "대상 멤버 닉네임")
            String nickname
    );
}
