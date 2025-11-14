package com.ssafy.agzak.domain.collection.repository;

import com.ssafy.agzak.domain.collection.dto.response.CollectionItemResponse;
import com.ssafy.agzak.domain.collection.entity.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface CollectionRepository extends JpaRepository<Collection, Long> {

    @Query("""
        select new com.ssafy.agzak.domain.collection.dto.response.CollectionItemResponse(
            ck.code, ck.name, r.code, c.count, c.obtainedAt
        )
        from Collection c
        join c.cookieKind ck
        join ck.rarity r
        where c.member.memberId = :memberId
        order by r.sortOrder asc, ck.code asc
    """)
    List<CollectionItemResponse> findAllByMemberId(Long memberId);

    /** 쿠키 생성시 도감 upsert (cookie_kind_id 기준) */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        INSERT INTO collection(member_id, cookie_kind_id, `count`, obtained_at)
        VALUES (?1, ?2, 1, ?3)
        ON DUPLICATE KEY UPDATE
          `count` = `count` + 1,
          obtained_at = IFNULL(obtained_at, VALUES(obtained_at))
        """, nativeQuery = true)
    void upsertOnCookieCreated(Long memberId, Long cookieKindId, LocalDateTime obtainedAt);

    /** 회원가입시 모든 쿠키 종류를 0으로 초기 생성 */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        INSERT INTO collection(member_id, cookie_kind_id, `count`, obtained_at)
        SELECT ?1, ck.cookie_kind_id, 0, NULL
        FROM cookie_kind ck
        WHERE ck.is_active = 1
        ON DUPLICATE KEY UPDATE
          member_id = VALUES(member_id), cookie_kind_id = VALUES(cookie_kind_id)
        """, nativeQuery = true)
    void initDefaultsForMember(Long memberId);
}