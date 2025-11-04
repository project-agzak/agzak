package com.ssafy.agzak.domain.inventory.controller;

import com.ssafy.agzak.docs.FortuneCookieApiDocs;
import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import com.ssafy.agzak.domain.inventory.service.CookieService;
import com.ssafy.agzak.global.security.AuthMemberProvider;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
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
    public ResponseEntity<Void> useCookie(@PathVariable Long cookieId) {
        Long memberId = authMemberProvider.currentMemberId();
        cookieService.useCookie(memberId, cookieId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{cookieId}")
    public ResponseEntity<CookieResponse> getCookieInfo(@PathVariable Long cookieId) {
        return ResponseEntity.ok().body(cookieService.getCookieInfo(cookieId));
    }

    @GetMapping
    public ResponseEntity<List<CookieResponse>> getInventory(@Parameter(
            description = "정렬 기준 (recent=최신순, score=총점 높은 순, category=카테고리 가나다순)",
            example = "recent",
            schema = @Schema(defaultValue = "recent", allowableValues = {"recent", "score", "category"})
    ) String sortType) {
        Long memberId = authMemberProvider.currentMemberId();
        return ResponseEntity.ok().body(cookieService.getFortuneCookie(memberId, sortType));
    }
}
