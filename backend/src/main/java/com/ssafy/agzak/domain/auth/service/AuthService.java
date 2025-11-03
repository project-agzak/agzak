package com.ssafy.agzak.domain.auth.service;

import com.ssafy.agzak.domain.auth.dto.request.LoginRequest;
import com.ssafy.agzak.domain.auth.dto.request.RegisterRequest;
import com.ssafy.agzak.domain.auth.dto.request.RegisterWithGuestRequest;
import com.ssafy.agzak.domain.auth.dto.response.TokenResponse;
import com.ssafy.agzak.domain.fortune.dto.response.KakaoAddressResponse;
import com.ssafy.agzak.domain.fortune.service.GeocodingService;
import com.ssafy.agzak.domain.guest.support.GuestProfileStore;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import com.ssafy.agzak.global.security.JwtProvider;
import com.ssafy.agzak.global.security.RefreshTokenStore;
import com.ssafy.agzak.global.security.TokenRevocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final MemberRepository members;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwt;
    private final RefreshTokenStore refreshStore;
    private final TokenRevocationService revoke;
    private final GeocodingService geocodingService;
    private final GuestProfileStore guestStore;

    private TokenResponse issueTokens(Long memberId) {
        String access = jwt.createAccess(memberId);
        String refresh = jwt.createRefresh(memberId);
        refreshStore.save(memberId, refresh, Duration.ofDays(jwt.getRefreshExpDays()));
        return new TokenResponse(access, refresh, jwt.getAccessExpMinutes() * 60L);
    }

    @Transactional
    public void register(RegisterRequest req) {
        if (members.existsByEmail(req.email()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        if (members.existsByNickname(req.nickname()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용중인 닉네임입니다.");

        KakaoAddressResponse.Document geo = geocodingService.getCoordinates(req.birthCity());

        members.save(Member.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .nickname(req.nickname())
                .gender(req.gender())
                .birthDate(req.birthDate())
                .birthTime(req.birthTime() == null ? LocalTime.MIDNIGHT : req.birthTime())
                .birthCity(req.birthCity())
                .latitude(geo.latitude())
                .longitude(geo.longitude())
                .status(Member.MemberStatus.ACTIVE)
                .build());
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest req) {
        var m = members.findByEmail(req.email())
                .orElseThrow(() -> new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (m.getStatus() != Member.MemberStatus.ACTIVE)
            throw new BadCredentialsException("비활성화된 계정입니다.");
        if (m.getPassword() == null || !passwordEncoder.matches(req.password(), m.getPassword()))
            throw new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");

        return issueTokens(m.getMemberId());
    }

    @Transactional
    public void logout(Long memberId, String accessToken) {
        refreshStore.delete(memberId);
        if (accessToken != null) {
            revoke.revoke(accessToken, Duration.ofMinutes(jwt.getAccessExpMinutes()));
        }
    }

    @Transactional
    public TokenResponse registerWithGuest(RegisterWithGuestRequest req) {
        if (members.existsByEmail(req.email()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");

        var gp = guestStore.find(req.guestId());
        if (gp == null) throw new BadCredentialsException("게스트 정보가 만료되었거나 없습니다.");

        String nickname = gp.nickname();
        if (members.existsByNickname(nickname)) {
            nickname = nickname + "_" + (int)(Math.random()*900+100);
        }

        var m = Member.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .nickname(nickname)
                .gender(gp.gender())
                .birthDate(gp.birthDate())
                .birthTime(gp.birthTime() == null ? LocalTime.MIDNIGHT : gp.birthTime())
                .birthCity(gp.birthCity())
                .latitude(gp.latitude())
                .longitude(gp.longitude())
                .status(Member.MemberStatus.ACTIVE)
                .build();

        members.save(m);

        guestStore.delete(req.guestId());

        return issueTokens(m.getMemberId());
    }

    @Transactional
    public void attachGuestProfile(Long memberId, String guestId) {
        var m = members.findById(memberId)
                .orElseThrow(() -> new BadCredentialsException("존재하지 않는 사용자"));
        var gp = guestStore.find(guestId);
        if (gp == null) throw new BadCredentialsException("게스트 정보가 만료되었거나 없습니다.");


        m.updateProfileIfEmptyOrOverwrite(
                gp.nickname(), gp.gender(),
                gp.birthDate(), gp.birthTime(),
                gp.birthCity(), gp.latitude(), gp.longitude()
        );

        guestStore.delete(guestId);
    }
}
