package com.ssafy.agzak.domain.ranking.controller;

import com.ssafy.agzak.docs.RankingApiDocs;
import com.ssafy.agzak.domain.ranking.dto.*;
import com.ssafy.agzak.domain.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rankings")
public class RankingController implements RankingApiDocs {

    private final RankingService rankingService;

    @Override
    @GetMapping("/today")
    public ResponseEntity<RankingListDto> today(@RequestParam(defaultValue="100") int limit) {
        return ResponseEntity.ok(rankingService.getTodayTopN(limit));
    }

    @Override
    @GetMapping("/{date}")
    public ResponseEntity<RankingListDto> snapshot(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue="100") int limit) {
        return ResponseEntity.ok(rankingService.getSnapshotTopN(date, limit));
    }

    @Override
    @GetMapping("/me/today")
    public ResponseEntity<MyRankDto> myToday() {
        long memberId = 1L; // TODO: JWT로 교체
        return ResponseEntity.ok(rankingService.getMyToday(memberId));
    }

    @Override
    @GetMapping("/me/{date}")
    public ResponseEntity<MyRankDto> mySnapshot(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        long memberId = 1L; // TODO: JWT로 교체
        return ResponseEntity.ok(rankingService.getMySnapshot(date, memberId));
    }
}
