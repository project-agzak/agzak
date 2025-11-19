package com.ssafy.agzak.domain.fortune.service;

import com.ssafy.agzak.domain.fortune.dto.response.FinalFortuneResponse;
import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;
import com.ssafy.agzak.domain.fortune.entity.FortuneType;
import com.ssafy.agzak.domain.fortune.repository.FortuneAspectRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneTypeRepository;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import com.ssafy.agzak.domain.ranking.service.RankingService;
import com.ssafy.agzak.global.time.DateProvider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

import static com.ssafy.agzak.global.tx.TxAfterCommit.afterCommit;

@Service
@RequiredArgsConstructor
public class FortuneWriter {
    private final RankingService rankingService;
    private final MemberRepository memberRepository;
    private final FortuneTypeRepository fortuneTypeRepository;
    private final FortuneRepository fortuneRepository;
    private final FortuneAspectRepository fortuneAspectRepository;
    private final DateProvider date;

    @Transactional
    public void saveFortune(long memberId, FinalFortuneResponse fortuneResponse) {
        if (fortuneResponse == null || fortuneResponse.type() == null || fortuneResponse.scores() == null) {
            throw new IllegalArgumentException("운세 응답 데이터가 유효하지 않습니다.");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 회원 아이디입니다."));
        FortuneType fortuneType = fortuneTypeRepository.findFortuneTypeByFortuneTypeId(fortuneResponse.type().id())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 운세 타입입니다."));

        LocalDate today = date.today();

        Fortune fortune = Fortune.builder()
                .member(member)
                .fortuneType(fortuneType)
                .date(today)
                .description(fortuneResponse.scores().totalSummary())
                .originalTotalScore(fortuneResponse.scores().totalScore())
                .totalScore(fortuneResponse.scores().totalScore())
                .build();

        fortuneRepository.save(fortune);
        afterCommit(() -> rankingService.refreshTodayForMember(memberId));

        saveAspect(fortune, FortuneAspect.AspectName.LOVE, fortuneResponse.scores().love(), fortuneResponse.scores().detailedSummaries().love());
        saveAspect(fortune, FortuneAspect.AspectName.MONEY, fortuneResponse.scores().money(), fortuneResponse.scores().detailedSummaries().money());
        saveAspect(fortune, FortuneAspect.AspectName.HEALTH, fortuneResponse.scores().health(), fortuneResponse.scores().detailedSummaries().health());
        saveAspect(fortune, FortuneAspect.AspectName.ACHIEVEMENT, fortuneResponse.scores().achievement(), fortuneResponse.scores().detailedSummaries().achievement());
    }

    private void saveAspect(Fortune fortune, FortuneAspect.AspectName name, int score, String description) {
        FortuneAspect aspect = FortuneAspect.builder()
                .fortune(fortune)
                .name(name)
                .score(score)
                .originalScore(score)
                .description(description)
                .build();
        fortuneAspectRepository.save(aspect);
    }
}
