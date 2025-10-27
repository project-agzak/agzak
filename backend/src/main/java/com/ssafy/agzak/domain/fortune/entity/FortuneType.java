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

    @Column(name = "description")
    private String description;

    @Column(name = "good_with", length = 50)
    private String goodWith;

    @Column(name = "bad_with", length = 50)
    private String badWith;
}
