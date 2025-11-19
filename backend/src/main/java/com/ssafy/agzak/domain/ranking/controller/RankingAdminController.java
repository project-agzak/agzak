package com.ssafy.agzak.domain.ranking.controller;

import com.ssafy.agzak.domain.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/rankings")
@RequiredArgsConstructor
public class RankingAdminController {
    private final RankingService rankingService;

    @PostMapping("/reseed-redis-today")
    public ResponseEntity<Void> reseedRedisToday() {
        rankingService.reseedRedisFromMysqlToday();
        return ResponseEntity.ok().build();
    }
}
