package com.ssafy.agzak.domain.gift.controller;

import com.ssafy.agzak.docs.GiftApiDocs;
import com.ssafy.agzak.domain.gift.dto.request.SendGiftRequest;
import com.ssafy.agzak.domain.gift.dto.response.GiftResponse;
import com.ssafy.agzak.domain.gift.service.GiftService;
import com.ssafy.agzak.global.security.AuthMemberProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/gifts")
@Validated
public class GiftController implements GiftApiDocs {

    private final GiftService giftService;
    private final AuthMemberProvider authMemberProvider;

    @PostMapping("/send")
    public ResponseEntity<Void> sendGift(@RequestBody @Valid SendGiftRequest request) {
        giftService.sendGift(authMemberProvider.currentMemberId(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/receive/{giftId}")
    public ResponseEntity<Void> receiveGift(@PathVariable @Valid Long giftId) {
        giftService.receiveGift(giftId, authMemberProvider.currentMemberId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{giftId}")
    public ResponseEntity<GiftResponse> getGiftInfo(@PathVariable @Valid Long giftId) {
        GiftResponse response = giftService.getGiftDetail(giftId, authMemberProvider.currentMemberId());
        return ResponseEntity.ok().build();
    }
}
