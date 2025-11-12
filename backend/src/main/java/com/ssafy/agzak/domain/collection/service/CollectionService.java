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

    @Transactional
    public void ensureDefaults(Member member) {
        collectionRepository.initDefaultsForMember(member.getMemberId());
    }

    /** 내 쿠키도감 */
    public List<CollectionItemResponse> getMyCollection() {
        long memberId = authMemberProvider.currentMemberId();
        return collectionRepository.findAllByMemberId(memberId);
    }

    /** 멤버 아이디로 조회 */
    public List<CollectionItemResponse> getCollectionByMemberId(Long memberId) {
        if (!memberRepository.existsByMemberIdAndStatus(memberId, Member.MemberStatus.ACTIVE)) {
            throw new MemberNotFoundException(memberId);
        }
        return collectionRepository.findAllByMemberId(memberId);
    }

    /** 멤버 닉네임으로 조회 */
    public List<CollectionItemResponse> getCollectionByNickname(String nickname) {
        Member m = memberRepository.findByNicknameAndStatus(nickname, Member.MemberStatus.ACTIVE)
                .orElseThrow(() -> new MemberNotFoundException(0L));
        return collectionRepository.findAllByMemberId(m.getMemberId());
    }
}
