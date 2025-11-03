package com.ssafy.agzak.domain.member.controller;

import com.ssafy.agzak.docs.MemberApiDocs;
import com.ssafy.agzak.domain.fortune.dto.response.DetailFortuneDataResponse;
import com.ssafy.agzak.domain.member.dto.response.MemberGraphResponse;
import com.ssafy.agzak.domain.member.dto.request.MemberEditRequest;
import com.ssafy.agzak.domain.member.dto.response.MemberInfoResponse;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/members")
public class MemberController implements MemberApiDocs {
    private final MemberService memberService;

    @GetMapping
    public ResponseEntity<MemberInfoResponse> getMemberInfo() {
        return ResponseEntity.ok().body(new MemberInfoResponse(1, "temp", "temp", Member.Gender.FEMALE,
                LocalDate.now(),null, null,null));
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
    public ResponseEntity<DetailFortuneDataResponse> getDetailData(@PathVariable LocalDate date) {
        return ResponseEntity.ok().body(memberService.getMemberFortune(1L, date));
    }

}
