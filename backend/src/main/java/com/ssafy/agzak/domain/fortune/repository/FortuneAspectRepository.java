package com.ssafy.agzak.domain.fortune.repository;

import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FortuneAspectRepository extends JpaRepository<FortuneAspect,Long> {
    List<FortuneAspect> findAllByFortune(Fortune fortune);
}
