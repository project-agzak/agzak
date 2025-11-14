package com.ssafy.agzak.domain.inventory.repository;

import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))
    @Query("select c from FortuneCookie c where c.fortuneCookieId = :fortuneCookieId")
    Optional<FortuneCookie> findByIdForUpdate(@Param("fortuneCookieId") Long fortuneCookieId);

    @Query("""
      select fc from FortuneCookie fc
      join fetch fc.cookieKind ck
      join fetch ck.rarity r
      where fc.inventory.member.memberId = :memberId
        and fc.status = com.ssafy.agzak.domain.inventory.entity.FortuneCookie.CookieStatus.AVAILABLE
    """)
    List<FortuneCookie> findAllAvailableWithKindByMember(@Param("memberId") Long memberId);
}
