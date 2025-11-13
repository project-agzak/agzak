package com.ssafy.agzak.docs;


import com.ssafy.agzak.domain.gift.dto.request.SendGiftRequest;
import com.ssafy.agzak.domain.gift.dto.response.GiftResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "쿠키 선물 API", description = "쿠키 선물 관련 API 문서")
public interface GiftApiDocs {
    @Operation(summary = "쿠키 선물 보내기", description = "쿠키를 다른 회원에게 선물로 보냅니다.")
    public ResponseEntity<Void> sendGift(@RequestBody @Valid SendGiftRequest request);
    @Operation(summary = "쿠키 선물 받기", description = "선물로 받은 쿠키를 수락하여 내 쿠키로 추가합니다.")
    public ResponseEntity<Void> receiveGift(@PathVariable @Valid Long giftId);
    @Operation(summary = "쿠키 선물 정보 조회", description = "특정 쿠키 선물의 상세 정보를 조회합니다.")
    public ResponseEntity<GiftResponse> getGiftInfo(@PathVariable @Valid Long giftId);
}
