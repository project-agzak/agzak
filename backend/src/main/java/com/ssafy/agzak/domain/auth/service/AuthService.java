package com.ssafy.agzak.domain.auth.service;

import com.ssafy.agzak.domain.auth.dto.request.LoginRequest;
import com.ssafy.agzak.domain.auth.dto.request.RegisterRequest;
import com.ssafy.agzak.domain.auth.dto.response.CheckEmailResponse;
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
import com.ssafy.agzak.domain.auth.dto.request.KakaoLoginRequest;
import com.ssafy.agzak.domain.auth.dto.request.KakaoCompleteSignupRequest;
import com.ssafy.agzak.domain.auth.dto.response.SocialLoginResponse;
import com.ssafy.agzak.domain.auth.entity.OAuthIdentity;
import com.ssafy.agzak.domain.auth.entity.OAuthIdentity.OAuthIdentityId;
import com.ssafy.agzak.domain.auth.entity.OAuthIdentity.OAuthProvider;
import com.ssafy.agzak.domain.auth.repository.OAuthIdentityRepository;
import com.ssafy.agzak.domain.auth.support.SocialSignupTicketStore;
import com.ssafy.agzak.domain.auth.client.KakaoApiClient;
import java.util.HashMap;

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
    private final KakaoApiClient kakao;
    private final OAuthIdentityRepository oauthRepo;
    private final SocialSignupTicketStore ticketStore;

    private TokenResponse issueTokens(Long memberId) {
        String access = jwt.createAccess(memberId);
        String refresh = jwt.createRefresh(memberId);
        refreshStore.save(memberId, refresh, Duration.ofDays(jwt.getRefreshExpDays()));
        return new TokenResponse(access, refresh, jwt.getAccessExpMinutes() * 60L);
    }

    // === 카카오 로그인 메인 진입 ===
    @Transactional
    public SocialLoginResponse kakaoLogin(KakaoLoginRequest req) {
        var me = kakao.getUserMe(req.accessToken());
        if (me == null || me.getId() == null) throw new BadCredentialsException("카카오 인증 실패");

        String sub = String.valueOf(me.getId());
        var existing = oauthRepo.findByIdProviderAndIdSub(OAuthProvider.KAKAO, sub);
        if (existing.isPresent()) {
            // 기존 회원 → 바로 로그인
            return SocialLoginResponse.ok(issueTokens(existing.get().getMember().getMemberId()));
        }

        // 신규: 게스트가 있으면 즉시 가입
        if (req.guestId() != null && !req.guestId().isBlank()) {
            var gp = guestStore.find(req.guestId());
            if (gp == null) throw new BadCredentialsException("게스트 정보가 만료되었거나 없습니다.");

            String nickname = gp.nickname() != null ? gp.nickname() :
                    (me.nickname() != null ? me.nickname() : "user");
            if (members.existsByNickname(nickname)) {
                nickname = nickname + "_" + (int)(Math.random()*900+100);
            }

            // email은 null 가능(스키마가 허용) — 있으면 저장
            var m = Member.builder()
                    .email(me.email())
                    .password(null) // 소셜 계정
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

            // OAuthIdentity 연결
            oauthRepo.save(OAuthIdentity.builder()
                    .id(OAuthIdentityId.builder()
                            .provider(OAuthProvider.KAKAO)
                            .sub(sub)
                            .build())
                    .member(m)
                    .build());

            guestStore.delete(req.guestId());

            return SocialLoginResponse.ok(issueTokens(m.getMemberId()));
        }

        // 게스트 없음 → 추가 정보 필요. 티켓 발급
        var payload = new HashMap<String, String>();
        payload.put("provider", OAuthProvider.KAKAO.name());
        payload.put("sub", sub);
        if (me.email() != null) payload.put("email", me.email());

        String ticket = ticketStore.create(payload);
        return SocialLoginResponse.needInfo(ticket, me.email(), me.nickname());
    }

    // === 카카오 완료: 티켓 + 추가정보로 가입 완료 ===
    @Transactional
    public TokenResponse kakaoCompleteSignup(KakaoCompleteSignupRequest req) {
        var payload = ticketStore.get(req.ticket());
        if (payload == null) throw new BadCredentialsException("회원가입 티켓이 만료되었습니다.");

        var provider = OAuthProvider.valueOf(payload.get("provider"));
        var sub = payload.get("sub");
        var email = payload.get("email"); // null 가능

        // 혹시 그 사이에 가입되었는지 확인
        if (oauthRepo.findByIdProviderAndIdSub(provider, sub).isPresent()) {
            // 이미 완료 상태라면 바로 로그인 토큰 발급
            var exist = oauthRepo.findByIdProviderAndIdSub(provider, sub).get().getMember();
            ticketStore.delete(req.ticket());
            return issueTokens(exist.getMemberId());
        }

        // 좌표 변환
        KakaoAddressResponse.Document geo = geocodingService.getCoordinates(req.birthCity());

        String nickname = req.nickname();
        if (members.existsByNickname(nickname)) {
            nickname = nickname + "_" + (int)(Math.random()*900+100);
        }

        var m = Member.builder()
                .email(email) // 카카오 이메일 동의 안 했으면 null
                .password(null)
                .nickname(nickname)
                .gender(req.gender())
                .birthDate(req.birthDate())
                .birthTime(req.birthTime() == null ? LocalTime.MIDNIGHT : req.birthTime())
                .birthCity(req.birthCity())
                .latitude(geo.latitude())
                .longitude(geo.longitude())
                .status(Member.MemberStatus.ACTIVE)
                .build();
        members.save(m);

        oauthRepo.save(OAuthIdentity.builder()
                .id(OAuthIdentityId.builder()
                        .provider(provider)
                        .sub(sub)
                        .build())
                .member(m)
                .build());

        ticketStore.delete(req.ticket());
        return issueTokens(m.getMemberId());
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

    public CheckEmailResponse checkEmail(String email) {
        if(members.existsByEmail(email)) {
            return new CheckEmailResponse(email, false);
        }

        return new CheckEmailResponse(email, true);
    }
}
