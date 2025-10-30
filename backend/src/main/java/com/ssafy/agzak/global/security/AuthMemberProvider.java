package com.ssafy.agzak.global.security;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthMemberProvider {
    public Long currentMemberId() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || a.getName() == null) {
            throw new BadCredentialsException("인증이 필요합니다.");
        }
        try {
            return Long.valueOf(a.getName());
        } catch (Exception e) {
            throw new BadCredentialsException("인증 토큰이 올바르지 않습니다.");
        }
    }

    public boolean isAuthenticated() {
        return SecurityContextHolder.getContext().getAuthentication() != null;
    }
}
