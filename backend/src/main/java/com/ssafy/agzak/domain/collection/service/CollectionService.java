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

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final MemberRepository memberRepository;
    private final AuthMemberProvider authMemberProvider;

    /** 회원가입/소셜로그인 완료 직후 도감 기본행 생성(0 카운트, 전종류) */
    @Transactional
    public void ensureDefaults(Member member) {
        collectionRepository.initDefaultsForMember(member.getMemberId());
    }

    /** 쿠키 생성 이벤트 → 해당 종류 도감 카운트 증가 */
    @Transactional
    public void onCookieCreated(Long memberId, Long cookieKindId, java.time.LocalDateTime obtainedAt) {
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
