package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.gift.dto.request.SendGiftRequest;
import com.ssafy.agzak.domain.gift.dto.response.GiftResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "쿠키 선물", description = "쿠키 선물 관련 API 문서")
public interface GiftApiDocs {

    @Operation(
            summary = "쿠키 선물 보내기",
            description = """
                내 인벤토리의 사용 가능 쿠키(AVAILABLE)를 특정 회원에게 선물 상태로 전환합니다.<br/>
                • 성공 시: 쿠키 상태 <code>AVAILABLE → PENDING_GIFT</code>, 선물 레코드 생성(<code>SENT</code>)<br/>
                • 제약: 본인 소유가 아니거나, 이미 PENDING_GIFT/USED/DELETED 상태면 실패
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "선물 전송 성공"),
            @ApiResponse(responseCode = "400", description = "요청 값 오류(존재하지 않는 회원/쿠키 등)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class),
                            examples = @ExampleObject("""
                                { "code":"BAD_REQUEST", "message":"쿠키 선물에 실패했습니다." }
                            """))),
            @ApiResponse(responseCode = "403", description = "권한 없음(타인 쿠키 전송 시도)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "상태 충돌(이미 선물 중/사용됨 등)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> sendGift(
            @RequestBody(
                    required = true,
                    description = "선물 보낼 대상/쿠키/메시지",
                    content = @Content(schema = @Schema(implementation = SendGiftRequest.class),
                            examples = @ExampleObject("""
                                {
                                  "receiverId": 202,
                                  "cookieId": 101,
                                  "message": "행운 가득하세요! :)"
                                }
                            """))
            )
            @Valid SendGiftRequest request
    );

    @Operation(
            summary = "쿠키 선물 받기(수락)",
            description = """
                선물을 수락하여 쿠키 소유권을 내 인벤토리로 이전합니다.<br/>
                • 성공 시: 선물 상태 <code>SENT → RECEIVED</code>, 쿠키 상태 <code>PENDING_GIFT → AVAILABLE</code><br/>
                • 제약: 수신자가 아니거나, 쿠키가 선물 대기 상태가 아니면 실패
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수락 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청/상태",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "권한 없음(수신자 아님)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "선물/쿠키 미존재",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "인벤토리 가득 참(>=50) 등 상태 충돌",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> receiveGift(
            @Parameter(description = "선물 ID", example = "3001")
            @PathVariable @Valid Long giftId
    );

    @Operation(
            summary = "쿠키 선물 정보 조회",
            description = """
                내가 받은 특정 선물의 상세 정보를 조회합니다(수신자만 조회 가능).<br/>
                포함: 발신자 정보, 쿠키 요약(종류/점수/생성시각), 메시지.
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = GiftResponse.class),
                            examples = @ExampleObject("""
                                {
                                  "giftId": 3001,
                                  "senderId": 101,
                                  "senderNickname": "cookieMaster",
                                  "cookie": {
                                    "fortuneCookieId": 987,
                                    "type": "MONEY",
                                    "love": 3,
                                    "money": 12,
                                    "achievement": 2,
                                    "health": 4,
                                    "createdAt": "2025-11-14T12:34:56"
                                  },
                                  "message": "부자 되세요!"
                                }
                            """))),
            @ApiResponse(responseCode = "403", description = "권한 없음(수신자 아님)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "선물 미존재",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<GiftResponse> getGiftInfo(
            @Parameter(description = "선물 ID", example = "3001")
            @PathVariable @Valid Long giftId
    );

    @Operation(
            summary = "쿠키 선물 거절",
            description = """
                선물을 거절합니다.<br/>
                • 성공 시: 선물 상태 <code>SENT → REJECTED</code><br/>
                • 쿠키는 선물 흐름 종료(삭제/무효화 정책은 서버 구현에 따름)
                """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "거절 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청/상태",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "권한 없음(수신자 아님)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "선물/쿠키 미존재",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> rejectGift(
            @Parameter(description = "선물 ID", example = "3001")
            @PathVariable @Valid Long giftId
    );
}
