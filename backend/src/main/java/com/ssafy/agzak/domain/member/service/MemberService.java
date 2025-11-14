package com.ssafy.agzak.domain.member.service;

import com.ssafy.agzak.domain.auth.repository.OAuthIdentityRepository;
import com.ssafy.agzak.domain.fortune.dto.response.DetailFortuneDataResponse;
import com.ssafy.agzak.domain.fortune.dto.response.FinalFortuneResponse;
import com.ssafy.agzak.domain.fortune.dto.response.FortuneAspectResponse;
import com.ssafy.agzak.domain.fortune.dto.response.FortuneTypeResponse;
import com.ssafy.agzak.domain.fortune.entity.Fortune;
import com.ssafy.agzak.domain.fortune.entity.FortuneAspect;
import com.ssafy.agzak.domain.fortune.repository.FortuneAspectRepository;
import com.ssafy.agzak.domain.fortune.repository.FortuneRepository;
import com.ssafy.agzak.domain.member.dto.request.MemberEditRequest;
import com.ssafy.agzak.domain.member.dto.response.MemberGraphResponse;
import com.ssafy.agzak.domain.member.dto.response.MemberInfoResponse;
import com.ssafy.agzak.domain.member.dto.response.SearchMemberResponse;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.exception.IllegalFortuneAspectException;
import com.ssafy.agzak.domain.member.exception.MemberNotFoundException;
import com.ssafy.agzak.domain.member.exception.NoFortuneFoundException;
import com.ssafy.agzak.domain.member.exception.NoSuchNicknameException;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import com.ssafy.agzak.domain.ranking.service.RankingService;
import com.ssafy.agzak.global.security.RefreshTokenStore;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.ssafy.agzak.global.tx.TxAfterCommit.afterCommit;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final FortuneRepository fortuneRepository;
    private final FortuneAspectRepository fortuneAspectRepository;
    private final OAuthIdentityRepository oauthRepo;
    private final RefreshTokenStore  refreshStore;
    private final RankingService rankingService;

    private Member findMemberOrThrow(long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberNotFoundException(memberId));
    }

    public MemberInfoResponse getMemberInfo(Long memberId) {
        Member member = findMemberOrThrow(memberId);
        return MemberInfoResponse.fromEntity(member);
    }

    public DetailFortuneDataResponse getMemberFortune(Long memberId, LocalDate date) {
        findMemberOrThrow(memberId);

        Fortune fortune = fortuneRepository.findByMember_MemberIdAndDate(memberId, date)
                .orElseThrow(() -> new NoFortuneFoundException(
                        "해당 멤버의 해당 날짜의 운세가 존재하지 않습니다. memberId=" + memberId + ", date=" + date,
                        memberId, date
                ));

        List<FortuneAspect> fortuneAspects = fortuneAspectRepository.findAllByFortune(fortune);
        if (fortuneAspects.size() != 4) {
            throw new IllegalFortuneAspectException(
                    "해당 멤버의 해당 날짜의 운세가 유효하지 않습니다. memberId=" + memberId + ", date=" + date
            );
        }

        List<FortuneAspectResponse> fortuneAspectResponses = fortuneAspects.stream()
                .map(FortuneAspectResponse::fromEntity)
                .toList();

        return new DetailFortuneDataResponse(
                fortune.getFortuneId(),
                fortune.getDescription(),
                fortune.getTotalScore(),
                fortune.getOriginalTotalScore(),
                FortuneTypeResponse.fromEntity(fortune.getFortuneType()),
                fortuneAspectResponses
        );
    }

    public List<MemberGraphResponse> getMemberGraph(long memberId, LocalDate startDate, LocalDate endDate) {
        Member member = findMemberOrThrow(memberId);

        List<Fortune> fortuneResults = fortuneRepository.findAllByMemberAndDateBetween(member, startDate, endDate);
        Map<LocalDate, DateScore> statMap = fortuneResults.stream()
                .collect(Collectors.toMap(Fortune::getDate, f -> new DateScore(f.getOriginalTotalScore(), f.getTotalScore())));

        return startDate.datesUntil(endDate.plusDays(1))
                .map(date -> new MemberGraphResponse(
                        date,
                        statMap.getOrDefault(date, new DateScore(0, 0)).originalScore,
                        statMap.getOrDefault(date, new DateScore(0, 0)).totalScore
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SearchMemberResponse> searchMember(@Valid String keyword) {
        List<Member> member = memberRepository.findByNicknameStartingWith(keyword);

        return member.stream()
                .map(SearchMemberResponse::from)
                .toList();
    }

    private record DateScore(int originalScore, int totalScore) { }

    @Transactional
    public void editMemberInfo(long memberId, MemberEditRequest request) {
        Member member = findMemberOrThrow(memberId);

        // 닉네임 변경
        if (request.nickname() != null) {
            String newNick = request.nickname().trim();
            String oldNick = member.getNickname();

            if (!newNick.equals(oldNick)) {
                if (memberRepository.existsByNicknameAndMemberIdNot(newNick, memberId)) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "이미 사용중인 닉네임입니다. memberId=" + memberId + ", nickname=" + newNick
                    );
                }
                member.updateNickname(newNick);
                afterCommit(() -> rankingService.refreshTodayForMember(memberId));
            }
        }

        // 출생시간 변경
        if (request.birthTime() != null) {
            member.updateBirthTime(request.birthTime());
        }
    }

    public FinalFortuneResponse getMemberFortuneAsFinal(Long memberId, LocalDate date) {
        findMemberOrThrow(memberId);

        Fortune fortune = fortuneRepository.findByMember_MemberIdAndDate(memberId, date)
                .orElseThrow(() -> new NoFortuneFoundException(
                        "해당 멤버의 해당 날짜의 운세가 존재하지 않습니다. memberId=" + memberId + ", date=" + date,
                        memberId, date
                ));
        List<FortuneAspect> aspects = fortuneAspectRepository.findAllByFortune(fortune);
        if (aspects.size() != 4) {
            throw new IllegalFortuneAspectException(
                    "해당 멤버의 해당 날짜의 운세가 유효하지 않습니다. memberId=" + memberId + ", date=" + date
            );
        }
        return FinalFortuneResponse.fromEntity(fortune, aspects);
    }

    @Transactional
    public void deleteMember(long memberId) {
        Member member = findMemberOrThrow(memberId);
        oauthRepo.deleteAllByMember(member);
        refreshStore.delete(memberId);
        member.deleteMember();
        memberRepository.delete(member);
        afterCommit(() -> rankingService.removeFromToday(memberId));
    }
}
