package com.ssafy.agzak.domain.member.repository;

import com.ssafy.agzak.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END " +
            "FROM Member m WHERE m.nickname = :nickname AND m.status = 'ACTIVE'")
    boolean existsByNickname(String nickname);

    Optional<Member> findByEmailAndPasswordIsNotNull(String email);

    boolean existsByEmailAndPasswordIsNotNullAndStatus(String email, Member.MemberStatus status);

    boolean existsByNicknameAndMemberIdNot(String nickname, Long memberId);
}
