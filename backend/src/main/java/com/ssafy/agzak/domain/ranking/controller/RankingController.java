package com.ssafy.agzak.domain.ranking.controller;

import com.ssafy.agzak.domain.ranking.dto.response.RankingResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "랭킹", description = "회원별 운세/게임 점수를 바탕으로 한 일일 랭킹 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ranking")
public class RankingController {

    @Operation(summary = "오늘의 랭킹 조회", description = "총점 기준으로 오늘 날짜의 랭킹을 반환합니다 (Mock 데이터).")
    @GetMapping("/today")
    public List<RankingResponse> getTodayRanking() {
        LocalDate today = LocalDate.now();

        return List.of(
                RankingResponse.builder()
                        .rankNo(1)
                        .memberId(101L)
                        .nickname("fortune_master")
                        .totalScore(155)
                        .date(today)
                        .build(),
                RankingResponse.builder()
                        .rankNo(2)
                        .memberId(102L)
                        .nickname("cookie_lover")
                        .totalScore(147)
                        .date(today)
                        .build(),
                RankingResponse.builder()
                        .rankNo(3)
                        .memberId(103L)
                        .nickname("daily_lucky")
                        .totalScore(139)
                        .date(today)
                        .build()
        );
    }
}

