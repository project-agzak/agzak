package com.ssafy.agzak.domain.member.service;

import com.ssafy.agzak.domain.fortune.dto.response.DetailFortuneDataResponse;
import com.ssafy.agzak.domain.fortune.dto.response.FortuneAspectResponse;
import com.ssafy.agzak.domain.fortune.dto.response.FortuneTypeResponse;
import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;
import com.ssafy.agzak.domain.member.exception.IllegalFortuneAspectException;
import com.ssafy.agzak.domain.member.exception.NoFortuneFoundException;
import com.ssafy.agzak.domain.fortune.repository.FortuneAspectRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.member.dto.response.MemberInfoResponse;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final FortuneRepository fortuneRepository;
    private final FortuneAspectRepository fortuneAspectRepository;

    public MemberInfoResponse getMemberInfo(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 멤버 아이디입니다."));

        return MemberInfoResponse.fromEntity(member);
    }

    public DetailFortuneDataResponse getMemberFortune(Long memberId, LocalDate date) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 멤버 아이디입니다."));

        Fortune fortune = fortuneRepository.findByMember_MemberIdAndDate(memberId, date)
                .orElseThrow(() -> new NoFortuneFoundException("해당 멤버의 해당 날짜의 운세가 존재하지 않습니다.", memberId, date));

        List<FortuneAspect> fortuneAspects = fortuneAspectRepository.findAllByFortune(fortune);
        if (fortuneAspects.size() != 4) {
            //예외처리
            throw new IllegalFortuneAspectException("해당 멤버의 해당 날짜의 운세가 유효하지 않습니다.");
        }

        List<FortuneAspectResponse> fortuneAspectResponses = fortuneAspects.stream()
                .map(FortuneAspectResponse::fromEntity)
                .toList();

        return new DetailFortuneDataResponse(fortune.getFortuneId(), fortune.getDescription(), fortune.getTotalScore(),
                fortune.getOriginalTotalScore(),
                FortuneTypeResponse.fromEntity(fortune.getFortuneType()),
                fortuneAspectResponses);
    }

}
