package com.ssafy.agzak.domain.oauth.entity;

import com.ssafy.agzak.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "oauth_identity",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_member_provider", columnNames = {"member_id", "provider"})
        }
)
public class OAuthIdentity {
    @EmbeddedId
    private OAuthIdentityId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_oauth_member"))
    private Member member;

    @Embeddable
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    @Builder
    public static class OAuthIdentityId {
        @Enumerated(EnumType.STRING)
        @Column(name = "provider", nullable = false, length = 50)
        private OAuthProvider provider;

        @Column(name = "sub", nullable = false, length = 255)
        private String sub;
    }

    public enum OAuthProvider { KAKAO, NAVER, GOOGLE }
}