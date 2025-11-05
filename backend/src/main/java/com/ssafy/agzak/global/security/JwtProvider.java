package com.ssafy.agzak.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
@Getter
public class JwtProvider {
    @Value("${jwt.secret}") private String secret;
    @Value("${jwt.issuer:agzak}") private String issuer;
    @Value("${jwt.access-exp-minutes:60}") private long accessExpMinutes;
    @Value("${jwt.refresh-exp-days:14}") private long refreshExpDays;

    private SecretKey key;

    @PostConstruct void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createAccess(Long memberId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setIssuer(issuer)
                .setSubject(String.valueOf(memberId))
                .claim("t", "access")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(accessExpMinutes * 60)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String createRefresh(Long memberId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setIssuer(issuer)
                .setSubject(String.valueOf(memberId))
                .claim("t", "refresh")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(refreshExpDays * 24 * 3600)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Long parseAccessUserId(String token) {
        Claims c = parse(token);
        if (!"access".equals(c.get("t"))) throw new IllegalArgumentException("access 토큰 아님");
        return Long.valueOf(c.getSubject());
    }

    public Long parseRefreshUserId(String token) {
        Claims c = parse(token);
        if (!"refresh".equals(c.get("t"))) throw new IllegalArgumentException("refresh 토큰 아님");
        return Long.valueOf(c.getSubject());
    }

    private Claims parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }
}