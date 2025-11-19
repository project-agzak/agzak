package com.ssafy.agzak.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class OAuthIdentityId implements Serializable {

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 50)
    private OAuthIdentity.OAuthProvider provider;

    @Column(name = "sub", nullable = false)
    private String sub;
}