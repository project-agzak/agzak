package com.ssafy.agzak.controller;

import com.ssafy.agzak.dto.request.MemberEditRequest;
import com.ssafy.agzak.dto.response.*;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/members")
public class MemberController {
    @GetMapping
    public ResponseEntity<MemberInfoResponse> getMemberInfo() {
        return ResponseEntity.ok().body(new MemberInfoResponse(1, "temp", "temp", "temp", "MALE",
                LocalDateTime.now(), "Dog","Seoul"));
    }

    @PutMapping
    public ResponseEntity<Void> editMemberInfo(@RequestBody MemberEditRequest request) {
        //TODO 닉네임 수정
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteMember() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/graphs")
    public ResponseEntity<?> getGraphs(@RequestParam LocalDateTime startDate,@RequestParam LocalDateTime endDate) {
        return ResponseEntity.ok().body(List.of(new MemberGraphResponse(LocalDateTime.now(), 1,1)));
    }

    @GetMapping("/fortunes")
    public ResponseEntity<?> getCalendar(@RequestParam LocalDateTime month) {
        //TODO 프론트와 상의 후 결정
        return ResponseEntity.ok().build();
    }

    @GetMapping("/fortunes/{date}")
    public ResponseEntity<DetailFortuneDataResponse> getDetailData(@PathVariable LocalDateTime date) {
        return ResponseEntity.ok().body(new DetailFortuneDataResponse(1, "겸손하세요",1,1,
                new FortuneTypeResponse(1,"개","금전은 좋다",2,3),
                List.of(new FortuneAspectResponse("금전운",1,1))));
    }

}
