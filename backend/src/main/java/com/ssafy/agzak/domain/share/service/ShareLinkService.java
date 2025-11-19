package com.ssafy.agzak.domain.share.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;

@Service
public class ShareLinkService {

    private final Key key;
    private final String baseUrl;
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    public ShareLinkService(
            @Value("${app.share.secret}") String secret,
            @Value("${app.share.base-url}") String baseUrl
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); // HS256
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    /** 24시간 만료 토큰 생성 및 전체 공유 URL 반환 */
    public ShareUrl issueTodayFortuneShareUrl(long memberId, LocalDate date) {
        var now   = new Date();
        var expAt = Date.from(date.plusDays(1)  // "내일 00:00 KST"까지 유효 (최대 24h)
                .atStartOfDay(KST).toInstant());

        String token = Jwts.builder()
                .setHeaderParam(Header.TYPE, Header.JWT_TYPE)
                .setClaims(Map.of(
                        "typ", "FORTUNE_SHARE",
                        "mid", memberId,
                        "date", date.toString()
                ))
                .setIssuedAt(now)
                .setExpiration(expAt)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        return new ShareUrl(baseUrl + "/" + token, expAt.getTime());
    }

    /** 토큰 파싱/검증 → (memberId, date) 반환 */
    public ShareTarget parseFortuneShareToken(String token) throws JwtException, IllegalArgumentException {
        var jws = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
        var c = jws.getBody();
        if (!"FORTUNE_SHARE".equals(c.get("typ"))) throw new JwtException("invalid share token type");

        long memberId = Long.parseLong(String.valueOf(c.get("mid")));
        LocalDate date = LocalDate.parse(String.valueOf(c.get("date")));
        return new ShareTarget(memberId, date);
    }

    public record ShareUrl(String url, long expiresAtMillis) {}
    public record ShareTarget(long memberId, LocalDate date) {}
}
