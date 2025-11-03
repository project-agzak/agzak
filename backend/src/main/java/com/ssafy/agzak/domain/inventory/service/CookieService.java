package com.ssafy.agzak.domain.inventory.service;

import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import com.ssafy.agzak.domain.inventory.repository.FortuneCookieRepository;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CookieService {
    private final FortuneCookieRepository fortuneCookieRepository;
    private final MemberRepository memberRepository;

    //TODO 쿠키 조회
    public CookieResponse getCookieInfo(long cookieId) {
        FortuneCookie cookie = fortuneCookieRepository.findById(cookieId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 쿠키 아이디입니다."));

        return CookieResponse.fromEntity(cookie);
    }

}
