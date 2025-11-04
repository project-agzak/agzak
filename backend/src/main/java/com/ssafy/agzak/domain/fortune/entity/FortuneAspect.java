package com.ssafy.agzak.domain.fortune.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Entity
@Table(
        name = "fortune_aspect",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_aspect_per_fortune", columnNames = {"fortune_id", "name"})
        }
)
public class FortuneAspect {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fortune_aspect_id", nullable = false)
    private Long fortuneAspectId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fortune_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_aspect_fortune"))
    private Fortune fortune;

    @Enumerated(EnumType.STRING)
    @Column(name = "name", nullable = false, length = 50)
    private AspectName name;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "original_score", nullable = false)
    private Integer originalScore;

    public enum AspectName { MONEY, LOVE, ACHIEVEMENT, HEALTH }

    @Builder
    public FortuneAspect(Fortune fortune, AspectName name, int score) {
        this.fortune = fortune;
        this.name = name;
        this.score = score;
        this.originalScore = score;
    }

    public void updateScore(int score) {
        this.score += score;
    }
}