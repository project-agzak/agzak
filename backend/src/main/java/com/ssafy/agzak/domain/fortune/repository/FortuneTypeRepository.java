package com.ssafy.agzak.domain.fortune.repository;

import com.ssafy.agzak.domain.fortune.entity.FortuneType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FortuneTypeRepository extends JpaRepository<FortuneType, Long> {
    Optional<FortuneType> findFortuneTypeByFortuneTypeId(Long id);
}
