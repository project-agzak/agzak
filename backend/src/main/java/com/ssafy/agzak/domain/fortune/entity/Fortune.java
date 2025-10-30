package com.ssafy.agzak.domain.fortune.entity;

import com.ssafy.agzak.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Entity
@Table(
        name = "fortune",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_fortune_member_date", columnNames = {"member_id", "date"})
        },
        indexes = {
                @Index(name = "IDX_fortune_date_score", columnList = "date, total_score")
        }
)
public class Fortune {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fortune_id", nullable = false)
    private Long fortuneId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_fortune_member"))
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fortune_type_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_fortune_type"))
    private FortuneType fortuneType;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "total_score", nullable = false)
    private Integer totalScore;

    @Column(name = "original_total_score", nullable = false)
    private Integer originalTotalScore;

    @Builder
    public Fortune(Member member, FortuneType fortuneType, String description, int score) {
        this.member = member;
        this.date = LocalDate.now();
        this.fortuneType = fortuneType;
        this.description = description;
        this.totalScore = score;
        this.originalTotalScore = score;
    }

    public void updateScore(int num) {
        this.totalScore += num;
    }

}
