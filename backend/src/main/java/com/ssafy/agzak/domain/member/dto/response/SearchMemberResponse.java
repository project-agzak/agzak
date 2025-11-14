package com.ssafy.agzak.domain.member.dto.response;

import com.ssafy.agzak.domain.member.entity.Member;
import lombok.Builder;

public record SearchMemberResponse(
    Long memberId,
    String nickname
) {
    @Builder
    public SearchMemberResponse {
    }

    public static SearchMemberResponse from(Member member) {
        return SearchMemberResponse.builder()
                .memberId(member.getMemberId())
                .nickname(member.getNickname())
                .build();
    }
}
