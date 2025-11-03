package com.ssafy.agzak.domain.inventory.controller;

import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import com.ssafy.agzak.domain.inventory.service.CookieService;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cookies")
public class FortuneCookieController {

    private final CookieService cookieService;

    @PostMapping("/{cookieId}")
    public ResponseEntity<?> useCookie(@PathVariable Long cookieId) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{cookieId}")
    public ResponseEntity<CookieResponse> getCookieInfo(@PathVariable Long cookieId) {
        return ResponseEntity.ok().body(cookieService.getCookieInfo(cookieId));
    }
    @GetMapping
    public ResponseEntity<List<CookieResponse>> getInventory(
            @PageableDefault(size = 10, sort = "cookieId", direction = Sort.Direction.DESC) Pageable pageable) {
        //TODO 정렬 기준 수정 필요
        //TODO 정렬 기준 ENUM 생성하기

       return ResponseEntity.ok().body(List.of(new CookieResponse(1L, "MONEY", 1,1,1,1, LocalDateTime.now())));
    }
}
