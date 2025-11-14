package com.ssafy.agzak.domain.cookie.repository;

import com.ssafy.agzak.domain.cookie.entity.CookieKind;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CookieKindRepository extends JpaRepository<CookieKind, Long> {
    Optional<CookieKind> findByCodeAndActiveTrue(String code);

    default CookieKind getActiveByCodeOrThrow(String code) {
        return findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new IllegalStateException("활성 CookieKind 없음: code=" + code));
    }
}
