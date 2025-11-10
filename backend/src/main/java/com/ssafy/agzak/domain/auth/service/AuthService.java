package com.ssafy.agzak.domain.auth.service;

import com.ssafy.agzak.domain.auth.client.KakaoApiClient;
import com.ssafy.agzak.domain.auth.client.KakaoOAuthClient;
import com.ssafy.agzak.domain.auth.dto.request.*;
import com.ssafy.agzak.domain.auth.dto.response.CheckEmailResponse;
import com.ssafy.agzak.domain.auth.dto.response.SocialLoginResponse;
import com.ssafy.agzak.domain.auth.dto.response.TokenResponse;
import com.ssafy.agzak.domain.auth.entity.OAuthIdentity;
import com.ssafy.agzak.domain.auth.entity.OAuthIdentity.OAuthIdentityId;
import com.ssafy.agzak.domain.auth.entity.OAuthIdentity.OAuthProvider;
import com.ssafy.agzak.domain.auth.repository.OAuthIdentityRepository;
import com.ssafy.agzak.domain.auth.support.SocialSignupTicketStore;
import com.ssafy.agzak.domain.fortune.dto.response.LatLng;
import com.ssafy.agzak.domain.fortune.service.GeocodingService;
import com.ssafy.agzak.domain.guest.dto.GuestProfile;
import com.ssafy.agzak.domain.guest.support.GuestProfileStore;
import com.ssafy.agzak.domain.inventory.entity.Inventory;
import com.ssafy.agzak.domain.inventory.repository.InventoryRepository;
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
import java.util.HashMap;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwt;
    private final TokenRevocationService revokeService;
    private final KakaoApiClient kakao;
    private final KakaoOAuthClient kakaoOAuth;
    private final GeocodingService geocodingService;
    private final RefreshTokenStore refreshStore;
    private final GuestProfileStore guestStore;
    private final SocialSignupTicketStore ticketStore;
    private final MemberRepository memberRepo;
    private final OAuthIdentityRepository oauthRepo;
    private final InventoryRepository inventoryRepo;

    private void ensureInventory(Member m) {
        inventoryRepo.findByMember(m)
                .orElseGet(() -> inventoryRepo.save(
                        Inventory.builder().member(m).build()
                ));
    }

    private TokenResponse issueTokens(Long memberId) {
        String access = jwt.createAccess(memberId);
        String refresh = jwt.createRefresh(memberId);
        refreshStore.save(memberId, refresh, Duration.ofDays(jwt.getRefreshExpDays()));
        return new TokenResponse(access, refresh, jwt.getAccessExpMinutes() * 60L);
    }

    // === 카카오 로그인 메인 진입 ===
    @Transactional
    public SocialLoginResponse kakaoLogin(KakaoLoginRequest req) {
        if (req.authCode() == null || req.authCode().isBlank()
                || req.redirectUri() == null || req.redirectUri().isBlank()) {
            throw new BadCredentialsException("authCode와 redirectUri가 필요합니다.");
        }

        // 1) 서버에서 토큰 교환
        var token = kakaoOAuth.exchangeCode(req.authCode(), req.redirectUri());
        if (token == null || token.getAccess_token() == null) {
            throw new BadCredentialsException("카카오 토큰 교환 실패");
        }
        String accessToken = token.getAccess_token();

        // 2) 카카오 사용자 조회
        var me = kakao.getUserMe(accessToken);
        if (me == null || me.getId() == null) throw new BadCredentialsException("카카오 인증 실패");

        String sub = String.valueOf(me.getId());
        String kakaoEmail = me.email();     // null 가능
        String kakaoNick  = me.nickname();  // null 가능

        var existing = oauthRepo.findByIdProviderAndIdSub(OAuthProvider.KAKAO, sub);

        // 공통: 게스트 즉시 전환 함수
        Function<GuestProfile, TokenResponse> signupFromGuest = gp -> {
            String nickname = gp.nickname() != null ? gp.nickname()
                    : (kakaoNick != null && !kakaoNick.isBlank() ? kakaoNick : "user");
            if (memberRepo.existsByNickname(nickname)) {
                nickname = nickname + "_" + (int)(Math.random()*900+100);
            }
            var m = Member.builder()
                    .email(kakaoEmail)
                    .password(null)
                    .nickname(nickname)
                    .gender(gp.gender())
                    .birthDate(gp.birthDate())
                    .birthTime(gp.birthTime() == null ? LocalTime.MIDNIGHT : gp.birthTime())
                    .birthCity(gp.birthCity())
                    .latitude(gp.latitude())
                    .longitude(gp.longitude())
                    .status(Member.MemberStatus.ACTIVE)
                    .build();
            memberRepo.save(m);
            ensureInventory(m);

            // 현 시점의 sub를 새 회원에 바인딩
            oauthRepo.save(OAuthIdentity.builder()
                    .id(OAuthIdentityId.builder().provider(OAuthProvider.KAKAO).sub(sub).build())
                    .member(m)
                    .build());

            return issueTokens(m.getMemberId());
        };

        // (1) 기존 연동이 있는 경우
        if (existing.isPresent()) {
            var linked = existing.get().getMember();

            if (linked.getStatus() == Member.MemberStatus.ACTIVE) {
                // A) 기존 활성 회원 → 즉시 로그인
                return SocialLoginResponse.ok(issueTokens(linked.getMemberId()));
            }

            // B) 기존 연결이 탈퇴 회원 → 연동 제거 후 새 가입 흐름
            oauthRepo.delete(existing.get()); // 고유키 충돌 방지 위해 바로 삭제

            if (req.guestId() != null && !req.guestId().isBlank()) {
                var gp = guestStore.find(req.guestId());
                if (gp == null) throw new BadCredentialsException("게스트 정보가 만료되었거나 없습니다.");

                // 게스트 즉시 전환 가입 + 토큰 발급
                var tokens = signupFromGuest.apply(gp);
                guestStore.delete(req.guestId());
                return SocialLoginResponse.ok(tokens);
            } else {
                // 게스트가 없으면 → 티켓 발급 후 추가정보 단계
                var payload = new HashMap<String, String>();
                payload.put("provider", OAuthProvider.KAKAO.name());
                payload.put("sub", sub);
                if (kakaoEmail != null) payload.put("email", kakaoEmail);

                String ticket = ticketStore.create(payload);
                return SocialLoginResponse.needInfo(ticket, kakaoEmail, kakaoNick);
            }
        }

        // (2) 연동 자체가 없을 때
        if (req.guestId() != null && !req.guestId().isBlank()) {
            var gp = guestStore.find(req.guestId());
            if (gp == null) throw new BadCredentialsException("게스트 정보가 만료되었거나 없습니다.");

            var tokens = signupFromGuest.apply(gp);
            guestStore.delete(req.guestId());
            return SocialLoginResponse.ok(tokens);
        } else {
            var payload = new HashMap<String, String>();
            payload.put("provider", OAuthProvider.KAKAO.name());
            payload.put("sub", sub);
            if (kakaoEmail != null) payload.put("email", kakaoEmail);

            String ticket = ticketStore.create(payload);
            return SocialLoginResponse.needInfo(ticket, kakaoEmail, kakaoNick);
        }
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
        LatLng geo = geocodingService.getCoordinates(req.birthCity());

        String nickname = req.nickname();
        if (memberRepo.existsByNickname(nickname)) {
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
        memberRepo.save(m);

        ensureInventory(m);

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
        if (memberRepo.existsByEmail(req.email()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        if (memberRepo.existsByNickname(req.nickname()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용중인 닉네임입니다.");

        LatLng geo = geocodingService.getCoordinates(req.birthCity());

        var m = memberRepo.save(Member.builder()
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

        ensureInventory(m);
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest req) {
        var m = memberRepo.findByEmail(req.email())
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
            revokeService.revoke(accessToken, Duration.ofMinutes(jwt.getAccessExpMinutes()));
        }
    }

    @Transactional
    public TokenResponse registerWithGuest(RegisterWithGuestRequest req) {
        if (memberRepo.existsByEmail(req.email()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");

        var gp = guestStore.find(req.guestId());
        if (gp == null) throw new BadCredentialsException("게스트 정보가 만료되었거나 없습니다.");

        String nickname = gp.nickname();
        if (memberRepo.existsByNickname(nickname)) {
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

        memberRepo.save(m);

        ensureInventory(m);

        guestStore.delete(req.guestId());

        return issueTokens(m.getMemberId());
    }

    @Transactional(readOnly = true)
    public TokenResponse refresh(String refreshToken) {
        Long memberId;
        try {
            memberId = jwt.parseRefreshUserId(refreshToken);
        } catch (Exception e) {
            throw new BadCredentialsException("유효하지 않은 리프레시 토큰입니다.");
        }

        // 서버 저장소(redis)에 보관된 최신 리프레시와 일치하는지 확인 (토큰 회전 보안)
        var saved = refreshStore.get(memberId).orElse(null);
        if (saved == null || !saved.equals(refreshToken)) {
            throw new BadCredentialsException("리프레시 토큰이 만료되었거나 회수되었습니다.");
        }

        // 회원 상태 체크 (탈퇴자는 갱신 불가)
        var m = memberRepo.findById(memberId)
                .orElseThrow(() -> new BadCredentialsException("회원 정보를 찾을 수 없습니다."));
        if (m.getStatus() != Member.MemberStatus.ACTIVE) {
            throw new BadCredentialsException("비활성화된 계정입니다.");
        }

        // 토큰 회전(rotate): 새 access/refresh 발급 + 기존 refresh 대체 저장
        return issueTokens(memberId);
    }

    public CheckEmailResponse checkEmail(String email) {
        if(memberRepo.existsByEmail(email)) {
            return new CheckEmailResponse(email, false);
        }

        return new CheckEmailResponse(email, true);
    }
}
