package com.ssafy.agzak.domain.fortune.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
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

    public enum AspectName { MONEY, LOVE, ACHIEVEMENT, HEALTH }
}