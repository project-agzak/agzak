package com.ssafy.agzak.domain.cookie.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "rarity",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_rarity_code", columnNames = "code"),
                @UniqueConstraint(name = "UQ_rarity_sort", columnNames = "sort_order")
        })
public class Rarity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rarity_id")
    private Long rarityId;

    @Column(name = "code", nullable = false, length = 50)
    private String code; // RARE | EPIC | UNIQUE

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
