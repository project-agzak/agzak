package com.ssafy.agzak.domain.inventory.repository;

import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FortuneCookieRepository extends JpaRepository<FortuneCookie, Long> {

    @Query("""
        select c from FortuneCookie c
        where c.inventory.member.memberId = :memberId
        and c.status = "AVAILABLE"
    """)
    List<FortuneCookie> findAllByMember(long memberId);

    @Query("""
        select count(fc) 
        from FortuneCookie fc 
        where fc.inventory.member.memberId = :memberId 
          and fc.status = com.ssafy.agzak.domain.inventory.entity.FortuneCookie.CookieStatus.AVAILABLE
    """)
    long countAvailableByMemberId(Long memberId);

    @Query("""
        select fc 
        from FortuneCookie fc 
        where fc.inventory.member.memberId = :memberId 
          and fc.status = com.ssafy.agzak.domain.inventory.entity.FortuneCookie.CookieStatus.AVAILABLE
        order by fc.createdAt asc
    """)
    List<FortuneCookie> findOldestAvailableByMemberId(Long memberId);

}
