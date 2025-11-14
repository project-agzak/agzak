package com.ssafy.agzak.domain.cookie.repository;

import com.ssafy.agzak.domain.cookie.entity.Rarity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RarityRepository extends JpaRepository<Rarity, Long> {
    Optional<Rarity> findByCode(String code); // "RARE" | "EPIC" | "UNIQUE"
}
