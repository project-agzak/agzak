package com.ssafy.agzak.domain.fortune.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(name = "fortune_type")
public class FortuneType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fortune_type_id", nullable = false)
    private Long fortuneTypeId;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "good_with_id",
            foreignKey = @ForeignKey(name = "FK_fortune_type_good_with")
    )
    private FortuneType goodWith;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "bad_with_id",
            foreignKey = @ForeignKey(name = "FK_fortune_type_bad_with")
    )
    private FortuneType badWith;
}
