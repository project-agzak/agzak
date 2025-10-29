package com.ssafy.agzak.domain.ranking.controller;

import com.ssafy.agzak.domain.ranking.dto.response.SnapshotRankingResponse;
import com.ssafy.agzak.domain.ranking.dto.response.TodayRankingResponse;
import com.ssafy.agzak.domain.ranking.service.RankingService;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Tag(name = "랭킹", description = "운세 랭킹 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rankings")
public class RankingController {

    private final RankingService rankingService;

    @Operation(summary = "오늘의 랭킹(실시간, Redis)",
            description = """
                    Redis ZSET 기반의 오늘 랭킹을 반환합니다.
                    - totalLeaderboard: 강화 후 총점 기준 내림차순
                    - originalLeaderboard: 강화 전 총점 기준 내림차순
                    각 항목에 증가율(increasePercent, %) 포함
                    """)
    @ApiResponse(responseCode = "200", description = "OK",
            content = @Content(schema = @Schema(implementation = TodayRankingResponse.class)))
    @GetMapping("/today")
    public ResponseEntity<TodayRankingResponse> getToday(
            @RequestParam(name = "limit", defaultValue = "100") int limit
    ) {
        var body = rankingService.getTodayFromRedis(limit);
        return ResponseEntity.ok(body);
    }

    @Operation(summary = "스냅샷 랭킹(과거일자, MySQL)",
            description = "특정 일자의 스냅샷 랭킹(총점 기준, 시간대별 집계 결과)을 반환합니다.")
    @ApiResponse(responseCode = "200", description = "OK",
            content = @Content(schema = @Schema(implementation = SnapshotRankingResponse.class)))
    @GetMapping("/{date}")
    public ResponseEntity<SnapshotRankingResponse> getSnapshot(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(name = "limit", defaultValue = "100") int limit
    ) {
        var body = rankingService.getSnapshotFromMysql(date, limit);
        return ResponseEntity.ok(body);
    }
}
