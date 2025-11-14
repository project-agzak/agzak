package com.ssafy.agzak.domain.share.controller;
import com.ssafy.agzak.docs.FortuneShareApiDocs;
import com.ssafy.agzak.domain.fortune.dto.response.FinalFortuneResponse;
import com.ssafy.agzak.domain.share.dto.response.ShareLinkResponse;
import com.ssafy.agzak.domain.share.service.ShareLinkService;
import com.ssafy.agzak.domain.member.service.MemberService;
import com.ssafy.agzak.global.security.AuthMemberProvider;
import com.ssafy.agzak.global.time.DateProvider;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/fortune/share")
public class FortuneShareController implements FortuneShareApiDocs {

    private final ShareLinkService shareLinkService;
    private final AuthMemberProvider authMemberProvider;
    private final DateProvider date;
    private final MemberService memberService;

    /** 로그인 사용자의 오늘 운세 공유 URL 발급 (서명 토큰 포함) */
    @PostMapping
    public ResponseEntity<ShareLinkResponse> issueShareUrl() {
        long memberId = authMemberProvider.currentMemberId();
        var today = date.today();
        var issued = shareLinkService.issueTodayFortuneShareUrl(memberId, today);
        return ResponseEntity.ok(new ShareLinkResponse(issued.url(), issued.expiresAtMillis()));
    }

    /** 공개 조회: 토큰 검증 후 memberId의 해당 날짜 운세를 반환  */
    @GetMapping("/{token}")
    public ResponseEntity<FinalFortuneResponse> resolveShare(@PathVariable String token) {
        try {
            var target = shareLinkService.parseFortuneShareToken(token);
            var data = memberService.getMemberFortuneAsFinal(target.memberId(), target.date());
            return ResponseEntity.ok(data);
        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 공유 토큰입니다.");
        }
    }
}