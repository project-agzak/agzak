package com.ssafy.agzak.domain.auth.repository;

import com.ssafy.agzak.domain.auth.entity.OAuthIdentity;
import com.ssafy.agzak.domain.auth.entity.OAuthIdentity.OAuthIdentityId;
import com.ssafy.agzak.domain.auth.entity.OAuthIdentity.OAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OAuthIdentityRepository extends JpaRepository<OAuthIdentity, OAuthIdentityId> {
    Optional<OAuthIdentity> findByIdProviderAndIdSub(OAuthProvider provider, String sub);
}