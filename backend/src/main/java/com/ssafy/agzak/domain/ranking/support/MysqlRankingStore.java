package com.ssafy.agzak.domain.ranking.support;

import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.ranking.entity.Ranking;
import com.ssafy.agzak.domain.ranking.repository.RankingRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class MysqlRankingStore {

    private final RankingRepository rankingRepository;
    private final FortuneRepository fortuneRepository;
    private final EntityManager em;

    public List<Fortune> fortunes(LocalDate date) {
        return fortuneRepository.findAllByDateWithMember(date);
    }

    public Optional<Fortune> findFortune(LocalDate date, Long memberId) {
        return fortuneRepository.findByMember_MemberIdAndDate(memberId, date);
    }

    @Transactional(readOnly = true)
    public Set<Long> existingMemberIds(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) return Set.of();
        return em.createQuery("select m.memberId from Member m where m.memberId in :ids", Long.class)
                .setParameter("ids", ids)
                .getResultStream()
                .collect(java.util.stream.Collectors.toSet());
    }

    /** JPA 프록시로 Member 참조 획득 */
    public Member refMember(Long memberId) {
        return em.getReference(Member.class, memberId);
    }

    /** 해당 날짜 스냅샷을 통으로 교체 */
    @Transactional
    public void replaceTodaySnapshot(LocalDate date, List<Ranking> rows) {
        rankingRepository.deleteByDate(date);
        if (rows != null && !rows.isEmpty()) {
            rankingRepository.saveAll(rows);
        }
    }
}
