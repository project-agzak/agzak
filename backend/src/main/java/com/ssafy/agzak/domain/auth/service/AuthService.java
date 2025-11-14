package com.ssafy.agzak.domain.auth.service;

import com.ssafy.agzak.domain.auth.client.KakaoApiClient;
import com.ssafy.agzak.domain.auth.client.KakaoOAuthClient;
import com.ssafy.agzak.domain.auth.dto.request.*;
import com.ssafy.agzak.domain.auth.dto.response.CheckEmailResponse;
import com.ssafy.agzak.domain.auth.dto.response.CheckNicknameResponse;
import com.ssafy.agzak.domain.auth.dto.response.SocialLoginResponse;
import com.ssafy.agzak.domain.auth.dto.response.TokenResponse;
import com.ssafy.agzak.domain.auth.entity.OAuthIdentity;
import com.ssafy.agzak.domain.auth.entity.OAuthIdentity.OAuthIdentityId;
import com.ssafy.agzak.domain.auth.entity.OAuthIdentity.OAuthProvider;
import com.ssafy.agzak.domain.auth.repository.OAuthIdentityRepository;
import com.ssafy.agzak.domain.auth.support.SocialSignupTicketStore;
import com.ssafy.agzak.domain.collection.service.CollectionService;
import com.ssafy.agzak.domain.fortune.dto.response.LatLng;
import com.ssafy.agzak.domain.fortune.service.GeocodingService;
import com.ssafy.agzak.domain.guest.dto.GuestProfile;
import com.ssafy.agzak.domain.guest.support.GuestProfileStore;
import com.ssafy.agzak.domain.inventory.entity.Inventory;
import com.ssafy.agzak.domain.inventory.repository.InventoryRepository;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import com.ssafy.agzak.domain.ranking.service.RankingService;
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

import static com.ssafy.agzak.global.tx.TxAfterCommit.afterCommit;

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
    private final RankingService rankingService;
    private final CollectionService collectionService;

    private void ensureInventory(Member m) {
        inventoryRepo.findByMember(m)
                .orElseGet(() -> inventoryRepo.save(
                        Inventory.builder().member(m).build()
                ));
    }

    private void ensureCollection(Member m) {
        collectionService.ensureDefaults(m);
    }

    private String socialEmail(String provider, String email, String sub) {
        String raw = (email != null && !email.isBlank()) ? email.trim() : sub;
        if (raw == null || raw.isBlank()) raw = "unknown";
        String val = (provider + "-" + raw);
        return val.length() > 255 ? val.substring(0, 255) : val;
    }

    private TokenResponse issueTokens(Long memberId) {
        String access = jwt.createAccess(memberId);
        String refresh = jwt.createRefresh(memberId);
        refreshStore.save(memberId, refresh, Duration.ofDays(jwt.getRefreshExpDays()));
        return new TokenResponse(access, refresh, jwt.getAccessExpMinutes() * 60L);
    }

    private String uniqueNickname(String base) {
        String sanitized = (base == null || base.isBlank()) ? "user" : base.trim();
        String candidate = sanitized;
        int i = 1;
        while (memberRepo.existsByNickname(candidate)) {
            candidate = sanitized + "_" + i++;
        }
        return candidate;
    }

    // === 카카오 로그인 ===
    @Transactional
    public SocialLoginResponse kakaoLogin(KakaoLoginRequest req) {
        if (req.authCode() == null || req.authCode().isBlank()
                || req.redirectUri() == null || req.redirectUri().isBlank()) {
            throw new BadCredentialsException("authCode와 redirectUri가 필요합니다.");
        }

        var token = kakaoOAuth.exchangeCode(req.authCode(), req.redirectUri());
        if (token == null || token.getAccess_token() == null) {
            throw new BadCredentialsException("카카오 토큰 교환 실패");
        }
        String accessToken = token.getAccess_token();

        var me = kakao.getUserMe(accessToken);
        if (me == null || me.getId() == null) throw new BadCredentialsException("카카오 인증 실패");

        String sub = String.valueOf(me.getId());
        String kakaoEmail = me.email();
        String kakaoNick  = me.nickname();

        var existing = oauthRepo.findByIdProviderAndIdSub(OAuthProvider.KAKAO, sub);

        // 게스트 → 신규 회원 전환(카카오)
        Function<GuestProfile, TokenResponse> signupFromGuest = gp -> {
            String baseNick = (gp.nickname() != null && !gp.nickname().isBlank())
                    ? gp.nickname()
                    : (kakaoNick != null && !kakaoNick.isBlank() ? kakaoNick : "user");
            String nickname = uniqueNickname(baseNick);

            var m = Member.builder()
                    .email(socialEmail("kakao", kakaoEmail, sub))
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
            ensureCollection(m);

            oauthRepo.save(OAuthIdentity.builder()
                    .id(OAuthIdentityId.builder().provider(OAuthProvider.KAKAO).sub(sub).build())
                    .member(m)
                    .build());

            return issueTokens(m.getMemberId());
        };

        if (existing.isPresent()) {
            var linked = existing.get().getMember();
            if (linked.getStatus() == Member.MemberStatus.ACTIVE) {
                return SocialLoginResponse.ok(issueTokens(linked.getMemberId()));
            }

            oauthRepo.delete(existing.get()); // 탈퇴 회원과의 연동 제거

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

        // 신규 연동
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

    // === 카카오 완료(추가정보) ===
    @Transactional
    public TokenResponse kakaoCompleteSignup(KakaoCompleteSignupRequest req) {
        var payload = ticketStore.get(req.ticket());
        if (payload == null) throw new BadCredentialsException("회원가입 티켓이 만료되었습니다.");

        var provider = OAuthProvider.valueOf(payload.get("provider"));
        var sub = payload.get("sub");
        var email = payload.get("email");

        if (oauthRepo.findByIdProviderAndIdSub(provider, sub).isPresent()) {
            var exist = oauthRepo.findByIdProviderAndIdSub(provider, sub).get().getMember();
            ticketStore.delete(req.ticket());
            return issueTokens(exist.getMemberId());
        }

        LatLng geo = geocodingService.getCoordinates(req.birthCity());

        String nickname = req.nickname();
        if (nickname == null || nickname.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "닉네임은 비어 있을 수 없습니다.");
        }
        nickname = nickname.trim();
        if (memberRepo.existsByNickname(nickname)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용중인 닉네임입니다.");
        }

        var m = Member.builder()
                .email(socialEmail("kakao", email, sub))
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
        ensureCollection(m);

        oauthRepo.save(OAuthIdentity.builder()
                .id(OAuthIdentityId.builder().provider(provider).sub(sub).build())
                .member(m)
                .build());

        ticketStore.delete(req.ticket());
        return issueTokens(m.getMemberId());
    }

    // === 일반 회원가입(이메일/비번) ===
    @Transactional
    public void register(RegisterRequest req) {
        // 이메일 중복은 "로컬+ACTIVE"에 대해서만 체크
        if (memberRepo.existsByEmailAndPasswordIsNotNullAndStatus(req.email(), Member.MemberStatus.ACTIVE)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        }
        // 닉네임 중복은 허용하지 않음 → 거절
        if (memberRepo.existsByNickname(req.nickname())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용중인 닉네임입니다.");
        }

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
        ensureCollection(m);
    }

    // === 게스트 → 일반 회원 전환(이메일/비번) ===
    @Transactional
    public TokenResponse registerWithGuest(RegisterWithGuestRequest req) {
        if (memberRepo.existsByEmailAndPasswordIsNotNullAndStatus(req.email(), Member.MemberStatus.ACTIVE)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        }

        var gp = guestStore.find(req.guestId());
        if (gp == null) throw new BadCredentialsException("게스트 정보가 만료되었거나 없습니다.");

        String nickname = gp.nickname();
        if (memberRepo.existsByNickname(nickname)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용중인 닉네임입니다.");
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
        ensureCollection(m);
        guestStore.delete(req.guestId());

        return issueTokens(m.getMemberId());
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest req) {
        var m = memberRepo.findByEmailAndPasswordIsNotNull(req.email())
                .orElseThrow(() -> new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (m.getStatus() != Member.MemberStatus.ACTIVE)
            throw new BadCredentialsException("비활성화된 계정입니다.");
        if (m.getPassword() == null || !passwordEncoder.matches(req.password(), m.getPassword()))
            throw new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");

        afterCommit(() -> rankingService.refreshTodayForMember(m.getMemberId()));
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

        var saved = refreshStore.get(memberId).orElse(null);
        if (saved == null || !saved.equals(refreshToken)) {
            throw new BadCredentialsException("리프레시 토큰이 만료되었거나 회수되었습니다.");
        }

        var m = memberRepo.findById(memberId)
                .orElseThrow(() -> new BadCredentialsException("회원 정보를 찾을 수 없습니다."));
        if (m.getStatus() != Member.MemberStatus.ACTIVE) {
            throw new BadCredentialsException("비활성화된 계정입니다.");
        }

        return issueTokens(memberId);
    }

    public CheckEmailResponse checkEmail(String email) {
        boolean available = !memberRepo.existsByEmailAndPasswordIsNotNullAndStatus(email, Member.MemberStatus.ACTIVE);
        return new CheckEmailResponse(email, available);
    }

    public CheckNicknameResponse checkNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            return new CheckNicknameResponse("", false);
        }
        String n = nickname.trim();
        boolean available = !memberRepo.existsByNicknameAndStatus(n, Member.MemberStatus.ACTIVE);
        return new CheckNicknameResponse(n, available);
    }

    @Transactional
    public void logout(Long memberId, String accessToken) {
        refreshStore.delete(memberId);
        if (accessToken != null) {
            revokeService.revoke(accessToken, Duration.ofMinutes(jwt.getAccessExpMinutes()));
        }
    }
}
