package com.ssafy.agzak.domain.collection.repository;

import com.ssafy.agzak.domain.collection.dto.response.CollectionItemResponse;
import com.ssafy.agzak.domain.collection.entity.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}
