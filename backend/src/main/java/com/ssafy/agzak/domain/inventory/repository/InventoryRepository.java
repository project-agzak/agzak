package com.ssafy.agzak.domain.inventory.repository;

import com.ssafy.agzak.domain.inventory.entity.Inventory;
import com.ssafy.agzak.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findTopByMemberOrderByInventoryIdAsc(Member member);
    Optional<Inventory> findByMember(Member member);
}
