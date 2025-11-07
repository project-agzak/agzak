package com.ssafy.agzak.domain.fortune.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.response.*;
import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;
import com.ssafy.agzak.domain.fortune.entity.FortuneType;
import com.ssafy.agzak.domain.fortune.repository.FortuneAspectRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneTypeRepository;
import com.ssafy.agzak.domain.guest.dto.GuestProfile;
import com.ssafy.agzak.domain.guest.support.GuestProfileStore;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import com.ssafy.agzak.domain.ranking.service.RankingService;
import com.ssafy.agzak.global.time.DateProvider;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static com.ssafy.agzak.global.tx.TxAfterCommit.afterCommit;

@Service
@RequiredArgsConstructor
@Slf4j
public class FortuneService {
    private final RankingService rankingService;
    private final FortuneTypeRepository fortuneTypeRepository;
    private final MemberRepository memberRepository;
    private final FortuneRepository fortuneRepository;
    private final FortuneAspectRepository fortuneAspectRepository;
    private final GuestProfileStore guestStore;
    private final DateProvider date;
    private final FortuneAiService fortuneAiService;

    public FinalFortuneResponse getMemberFortune(long memberId, BirthDataInput input, String city) {
        if (!checkDuplicate(memberId, date.today())) {
            return fortuneAiService.getFortuneScores(input, city);
        }

        Fortune fortune = fortuneRepository.findByMember_MemberIdAndDate(memberId,date.today())
                .orElseThrow(() -> new IllegalArgumentException("일치하는 멤버의 운세가 없습니다."));

        List<FortuneAspect> fortuneAspects = fortuneAspectRepository.findAllByFortune(fortune);
        return FinalFortuneResponse.fromEntity(fortune, fortuneAspects);
    }



    @Transactional
    public String saveGuestProfile(GuestProfile profile) {
        return guestStore.save(profile);
    }

    @Transactional
    public void saveFortune(long memberId, FinalFortuneResponse fortuneResponse) {
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

    public boolean checkDuplicate(long memberId, LocalDate date) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 회원 아이디입니다."));

        return fortuneRepository.existsByMemberAndDate(member, date);
    }
}
