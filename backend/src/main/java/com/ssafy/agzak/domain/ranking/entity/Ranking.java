package com.ssafy.agzak.domain.ranking.entity;

import com.ssafy.agzak.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "ranking",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_ranking_member_date", columnNames = {"member_id", "date"})
        },
        indexes = {
                @Index(name = "IDX_ranking_date_rank", columnList = "date, rank_no")
        }
)
public class Ranking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ranking_id", nullable = false)
    private Long rankingId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_ranking_member"))
    private Member member;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "rank_no", nullable = false)
    private Integer rankNo;

    @Column(name = "total_score", nullable = false)
    private Integer totalScore;

    @Column(name = "original_total_score", nullable = false)
    private Integer originalTotalScore;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
