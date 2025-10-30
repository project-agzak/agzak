package com.ssafy.agzak.domain.inventory.repository;

import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FortuneCookieRepository extends JpaRepository<FortuneCookie, Long> {
}
