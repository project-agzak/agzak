package com.ssafy.agzak.domain.collection.service;

import com.ssafy.agzak.domain.collection.dto.response.CollectionItemResponse;
import com.ssafy.agzak.domain.collection.repository.CollectionRepository;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.exception.MemberNotFoundException;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import com.ssafy.agzak.global.security.AuthMemberProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final MemberRepository memberRepository;
    private final AuthMemberProvider authMemberProvider;

    /** 회원가입/소셜로그인 직후 기본행 생성: 활성 쿠키만 */
    @Transactional
    public void ensureDefaults(Member member) {
        collectionRepository.initDefaultsForMember(member.getMemberId());
    }

    /** 쿠키 생성 이벤트 → 도감 카운트 증가 (활성/비활성 여부는 FK 단계에서 이미 보장) */
    @Transactional
    public void onCookieCreated(Long memberId, Long cookieKindId, LocalDateTime obtainedAt) {
        collectionRepository.upsertOnCookieCreated(memberId, cookieKindId, obtainedAt);
    }

    public List<CollectionItemResponse> getMyCollection() {
        long memberId = authMemberProvider.currentMemberId();
        return collectionRepository.findAllByMemberId(memberId);
    }

    public List<CollectionItemResponse> getCollectionByMemberId(Long memberId) {
        if (!memberRepository.existsByMemberIdAndStatus(memberId, Member.MemberStatus.ACTIVE)) {
            throw new MemberNotFoundException(memberId);
        }
        return collectionRepository.findAllByMemberId(memberId);
    }

    public List<CollectionItemResponse> getCollectionByNickname(String nickname) {
        var m = memberRepository.findByNicknameAndStatus(nickname, Member.MemberStatus.ACTIVE)
                .orElseThrow(() -> new MemberNotFoundException(0L));
        return collectionRepository.findAllByMemberId(m.getMemberId());
    }
}