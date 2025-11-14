package com.ssafy.agzak.domain.cookie.repository;

import com.ssafy.agzak.domain.cookie.entity.CookieKind;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CookieKindRepository extends JpaRepository<CookieKind, Long> {
    Optional<CookieKind> findByCode(String code); // ex) "MONEY", "LAVA" ...
}
