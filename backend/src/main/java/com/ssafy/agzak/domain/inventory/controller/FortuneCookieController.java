package com.ssafy.agzak.domain.inventory.controller;

import com.ssafy.agzak.docs.FortuneCookieApiDocs;
import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import com.ssafy.agzak.domain.inventory.service.CookieService;
import com.ssafy.agzak.global.security.AuthMemberProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cookies")
public class FortuneCookieController implements FortuneCookieApiDocs {

    private final CookieService cookieService;
    private final AuthMemberProvider authMemberProvider;

    @PostMapping("/{cookieId}")
    @Override
    public ResponseEntity<Void> useCookie(@PathVariable Long cookieId) {
        Long memberId = authMemberProvider.currentMemberId();
        cookieService.useCookie(memberId, cookieId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{cookieId}")
    @Override
    public ResponseEntity<CookieResponse> getCookieInfo(@PathVariable Long cookieId) {
        return ResponseEntity.ok(cookieService.getCookieInfo(cookieId));
    }

    @GetMapping
    @Override
    public ResponseEntity<List<CookieResponse>> getInventory(
            @RequestParam(defaultValue = "recent") String sortType
    ) {
        Long memberId = authMemberProvider.currentMemberId();
        return ResponseEntity.ok(cookieService.getFortuneCookie(memberId, sortType));
    }

    @DeleteMapping("/{cookieId}")
    @Override
    public ResponseEntity<Void> deleteCookie(@PathVariable Long cookieId) {
        Long memberId = authMemberProvider.currentMemberId();
        cookieService.deleteCookie(memberId, cookieId);
        return ResponseEntity.noContent().build();
    }
}
