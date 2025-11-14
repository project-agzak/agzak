package com.ssafy.agzak.domain.collection.repository;

import com.ssafy.agzak.domain.collection.dto.response.CollectionItemResponse;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CollectionRepository extends Repository<com.ssafy.agzak.domain.collection.entity.Collection, Long> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        INSERT INTO collection (member_id, cookie_kind_id, count, obtained_at)
        SELECT :memberId, ck.cookie_kind_id, 0, NULL
        FROM cookie_kind ck
        WHERE ck.is_active = 1
          AND NOT EXISTS (
            SELECT 1 FROM collection c
            WHERE c.member_id = :memberId AND c.cookie_kind_id = ck.cookie_kind_id
          )
        """, nativeQuery = true)
    void initDefaultsForMember(@Param("memberId") Long memberId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        INSERT INTO collection (member_id, cookie_kind_id, count, obtained_at)
        VALUES (:memberId, :cookieKindId, 1, :obtainedAt)
        ON DUPLICATE KEY UPDATE
          count = count + 1,
          obtained_at = COALESCE(obtained_at, VALUES(obtained_at))
        """, nativeQuery = true)
    void upsertOnCookieCreated(@Param("memberId") Long memberId,
                               @Param("cookieKindId") Long cookieKindId,
                               @Param("obtainedAt") LocalDateTime obtainedAt);

    @Query(value = """
        SELECT new com.ssafy.agzak.domain.collection.dto.response.CollectionItemResponse(
            ck.code,
            ck.name,
            r.code,
            ck.recipe,
            ck.message,
            c.count,
            c.obtainedAt
        )
        FROM com.ssafy.agzak.domain.collection.entity.Collection c
           JOIN c.cookieKind ck
           JOIN ck.rarity r
        WHERE c.member.memberId = :memberId
          AND ck.active = true
        ORDER BY r.sortOrder ASC, ck.code ASC
        """)
    List<CollectionItemResponse> findAllByMemberId(@Param("memberId") Long memberId);
}