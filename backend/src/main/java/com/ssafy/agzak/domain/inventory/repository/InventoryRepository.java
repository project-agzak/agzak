package com.ssafy.agzak.domain.inventory.repository;

import com.ssafy.agzak.domain.inventory.entity.Inventory;
import com.ssafy.agzak.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByInventoryId(Long id);
    long countByMember(Member member);
}
