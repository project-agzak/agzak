package com.ssafy.agzak.domain.inventory.entity;

import com.ssafy.agzak.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "inventory",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_inventory_member", columnNames = {"member_id", "inventory_id"})
        }
)
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id", nullable = false)
    private Long inventoryId;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_inventory_member"))
    private Member member;
}
