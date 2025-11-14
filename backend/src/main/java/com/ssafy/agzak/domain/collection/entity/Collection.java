package com.ssafy.agzak.domain.collection.entity;

import com.ssafy.agzak.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(name = "collection",
        uniqueConstraints = @UniqueConstraint(name = "UQ_collection_member_type", columnNames = {"member_id","type"}),
        indexes = @Index(name = "IDX_collection_member", columnList = "member_id"))
public class Collection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "collection_id", nullable = false)
    private Long collectionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_collection_member"))
    private Member member;

    @Column(name = "type", nullable = false, length = 50)
    private String type; // MONEY, LOVE, ACHIEVEMENT, HEALTH, MIXED, ROTTEN

    @Column(name = "count", nullable = false)
    private int count;

    @Column(name = "description")
    private String description;

    @Column(name = "obtained_at")
    private LocalDateTime obtainedAt;

    public void increase(int delta, LocalDateTime when) {
        this.count = Math.max(0, this.count + delta);
        if (delta > 0) this.obtainedAt = (this.obtainedAt == null ? when : this.obtainedAt);
    }
}
