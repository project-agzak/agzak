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
            c.type, c.count, c.description, c.obtainedAt
        )
        from Collection c
        where c.member.memberId = :memberId
        order by c.type asc
    """)
    List<CollectionItemResponse> findAllByMemberId(Long memberId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        INSERT INTO collection(member_id, type, `count`, description, obtained_at)
        VALUES (?1, ?2, 1, ?3, ?4)
        ON DUPLICATE KEY UPDATE
          `count` = `count` + 1,
          obtained_at = IFNULL(obtained_at, VALUES(obtained_at)),
          description = IFNULL(description, VALUES(description))
        """, nativeQuery = true)
    void upsertOnCookieCreated(Long memberId, String type, String firstDescription, LocalDateTime obtainedAt);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        INSERT INTO collection(member_id, type, count, description, obtained_at)
        VALUES 
          (?1, 'MONEY',        0, NULL, NULL),
          (?1, 'LOVE',         0, NULL, NULL),
          (?1, 'ACHIEVEMENT',  0, NULL, NULL),
          (?1, 'HEALTH',       0, NULL, NULL),
          (?1, 'MIXED',        0, NULL, NULL),
          (?1, 'ROTTEN',       0, NULL, NULL)
        ON DUPLICATE KEY UPDATE 
          member_id = VALUES(member_id), type = VALUES(type)
        """, nativeQuery = true)
    void initDefaultsForMember(Long memberId);
}
