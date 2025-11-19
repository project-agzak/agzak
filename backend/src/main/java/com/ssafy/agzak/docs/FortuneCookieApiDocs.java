package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "포춘 쿠키", description = "포춘 쿠키(보유/사용/조회/삭제) API")
public interface FortuneCookieApiDocs {

    @Operation(
            summary = "쿠키 상세 조회",
            description = "쿠키 ID로 단일 쿠키의 상세 정보를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = CookieResponse.class),
                            examples = @ExampleObject("""
                                {
                                  "fortuneCookieId": 101,
                                  "cookieKindId": 6,
                                  "code": "MONEY",
                                  "name": "금전 쿠키",
                                  "rarityCode": "RARE",
                                  "love": 3,
                                  "money": 12,
                                  "achievement": 2,
                                  "health": 4,
                                  "createdAt": "2025-11-14T12:34:56"
                                }
                                """))),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 쿠키",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<CookieResponse> getCookieInfo(
            @Parameter(description = "쿠키 ID", example = "1")
            @PathVariable Long cookieId
    );

    @Operation(
            summary = "쿠키 사용",
            description = """
                오늘자 회원 운세에 쿠키 효과를 적용합니다.<br/>
                • 성공 시: 각 영역 점수 및 총점이 쿠키 수치만큼 반영되고, 쿠키 상태가 <code>USED</code>로 변경됩니다.
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "쿠키 사용 성공"),
            @ApiResponse(responseCode = "404", description = "오늘 운세 없음 또는 쿠키 미존재",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> useCookie(
            @Parameter(description = "사용할 쿠키 ID", example = "1")
            @PathVariable Long cookieId
    );

    @Operation(
            summary = "보유 쿠키 목록 조회",
            description = """
                사용자가 보유한 쿠키를 조회합니다.<br/><br/>
                <b>정렬 기준(sortType)</b><br/>
                • <code>recent</code> : 생성 최신순 (기본값)<br/>
                • <code>score</code> : 쿠키 총점 높은 순<br/>
                • <code>kind</code>  : 희귀도(sortOrder) 오름차순 → 같은 희귀도 내 code 오름차순
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = CookieResponse.class)),
                            examples = @ExampleObject("""
                                [
                                  {
                                    "fortuneCookieId": 101,
                                    "cookieKindId": 6,
                                    "code": "MONEY",
                                    "name": "금전 쿠키",
                                    "rarityCode": "RARE",
                                    "love": 3, "money": 12, "achievement": 2, "health": 4,
                                    "createdAt": "2025-11-14T12:34:56"
                                  },
                                  {
                                    "fortuneCookieId": 102,
                                    "cookieKindId": 5,
                                    "code": "MIXED",
                                    "name": "믹스 쿠키",
                                    "rarityCode": "EPIC",
                                    "love": 7, "money": 8, "achievement": 9, "health": 10,
                                    "createdAt": "2025-11-14T12:40:00"
                                  }
                                ]
                                """)
                    )),
            @ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<List<CookieResponse>> getInventory(
            @Parameter(
                    description = "정렬 기준",
                    example = "recent",
                    schema = @Schema(allowableValues = {"recent", "score", "kind"}, defaultValue = "recent")
            )
            @RequestParam(defaultValue = "recent") String sortType
    );

    @Operation(
            summary = "쿠키 삭제",
            description = """
                본인 소유이며 <code>AVAILABLE</code> 상태인 쿠키만 삭제합니다.<br/>
                • 성공 시: 204 No Content<br/>
                • 제약: 사용된 쿠키(<code>USED</code>)는 삭제 불가
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공(내용 없음)"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청(쿠키 ID 등)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "본인 소유가 아닌 쿠키 삭제 시도",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "쿠키 미존재",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "사용된 쿠키 삭제 시도(상태 충돌)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> deleteCookie(
            @Parameter(description = "삭제할 쿠키 ID", example = "1")
            @PathVariable Long cookieId
    );
}