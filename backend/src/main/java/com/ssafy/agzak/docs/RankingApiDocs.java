package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.ranking.dto.MyRankDto;
import com.ssafy.agzak.domain.ranking.dto.RankingListDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;

@Tag(name = "랭킹", description = "운세 랭킹 API")
public interface RankingApiDocs {

    @Operation(summary = "오늘의 랭킹(REDIS)")
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = RankingListDto.class)))
    ResponseEntity<RankingListDto> today(int limit);

    @Operation(summary = "스냅샷 랭킹(과거일자, MySQL)")
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = RankingListDto.class)))
    ResponseEntity<RankingListDto> snapshot(
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            int limit);

    @Operation(summary = "내 랭킹(오늘, REDIS)")
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = MyRankDto.class)))
    ResponseEntity<MyRankDto> myToday();

    @Operation(summary = "내 랭킹(과거일자, MySQL)")
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = MyRankDto.class)))
    ResponseEntity<MyRankDto> mySnapshot(@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date);
}
