package com.ssafy.agzak.domain.coupon.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "coupon_types")
@Getter
@NoArgsConstructor
public class CouponType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_name", nullable = false, unique = true)
    private String typeName;

    @Builder
    public CouponType(String typeName) {
        this.typeName = typeName;
    }
}
