package com.ssafy.agzak.domain.member.controller;

import com.ssafy.agzak.docs.MemberApiDocs;
import com.ssafy.agzak.domain.fortune.dto.response.DetailFortuneDataResponse;
import com.ssafy.agzak.domain.member.dto.response.MemberGraphResponse;
import com.ssafy.agzak.domain.member.dto.request.MemberEditRequest;
import com.ssafy.agzak.domain.member.dto.response.MemberInfoResponse;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.service.MemberService;
import com.ssafy.agzak.global.security.AuthMemberProvider;
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
    private final AuthMemberProvider authMemberProvider;

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
    public ResponseEntity<?> getGraphs(@RequestParam LocalDate startDate,@RequestParam LocalDate endDate) {
        long memberId = authMemberProvider.currentMemberId();

        return ResponseEntity.ok().body(memberService.getMemberGraph(memberId, startDate, endDate));
    }

    @GetMapping("/fortunes/{date}")
    public ResponseEntity<DetailFortuneDataResponse> getDetailData(@PathVariable LocalDate date) {
        return ResponseEntity.ok().body(memberService.getMemberFortune(1L, date));
    }

}
