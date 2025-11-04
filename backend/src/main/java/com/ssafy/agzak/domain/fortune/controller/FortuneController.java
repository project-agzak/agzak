package com.ssafy.agzak.domain.fortune.controller;

import com.ssafy.agzak.docs.FortuneApiDocs;
import com.ssafy.agzak.domain.fortune.service.AstrologyCalculationService;
import com.ssafy.agzak.domain.fortune.service.FortuneService;
import com.ssafy.agzak.domain.fortune.service.FortuneTypeService;
import com.ssafy.agzak.domain.fortune.service.GeocodingService;
import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.request.GuestFortuneRequest;
import com.ssafy.agzak.domain.fortune.dto.response.*;
import com.ssafy.agzak.domain.guest.dto.GuestProfile;
import com.ssafy.agzak.domain.member.dto.response.MemberInfoResponse;
import com.ssafy.agzak.domain.member.service.MemberService;
import com.ssafy.agzak.global.security.AuthMemberProvider;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/fortune")
public class FortuneController implements FortuneApiDocs {

    private final AstrologyCalculationService astrologyCalculationService;
    private final GeocodingService geocodingService;
    private final FortuneService fortuneService;
    private final FortuneTypeService fortuneTypeService;
    private final MemberService memberService;
    private final AuthMemberProvider authMemberProvider;

    @PostMapping
    public ResponseEntity<FinalFortuneResponse> postMemberTodayFortune() {
        long memberId = authMemberProvider.currentMemberId();
        fortuneService.checkDuplicate(memberId, LocalDate.now());
        MemberInfoResponse response = memberService.getMemberInfo(memberId);
        BirthDataInput input = BirthDataInput.fromMemberInfo(response);
        FinalFortuneResponse result = fortuneService.getFortuneScores(input, response.birthCity());
        fortuneService.saveFortune(memberId, result);
        return ResponseEntity.ok().body(result);
    }

    @PostMapping("/guest")
    public ResponseEntity<GuestFortuneWithIdResponse> postGuestFortune(
            @RequestBody GuestFortuneRequest req
    ) {
        var geo = geocodingService.getCoordinates(req.birthCity());

        var input = new BirthDataInput(req.birthDate(), req.birthTime(), geo.latitude(), geo.longitude());
        FinalFortuneResponse fortune = fortuneService.getFortuneScores(input, req.birthCity());

        var profile = new GuestProfile(
                req.nickname(), req.gender(), req.birthDate(), req.birthTime(),
                req.birthCity(), geo.latitude(), geo.longitude()
        );
        String guestId = fortuneService.saveGuestProfile(profile);

        return ResponseEntity.ok(new GuestFortuneWithIdResponse(fortune, guestId));
    }


    @GetMapping("/fortuneType/{fortuneTypeId}")
    public ResponseEntity<FortuneTypeResponse> getFortuneTypeDetail(@PathVariable Long fortuneTypeId) {
        return ResponseEntity.ok().body(fortuneTypeService.getFortuneType(fortuneTypeId));
    }

    @Hidden
    @PostMapping("/test")
    public ResponseEntity<AiPromptData> test(@RequestBody BirthDataInput test) {
        return ResponseEntity.ok().body(astrologyCalculationService.generateAiPromptData(test));
    }

    @Hidden
    @GetMapping("/city")
    public ResponseEntity<KakaoAddressResponse.Document> testMap(@RequestParam String city) {
        return ResponseEntity.ok().body(geocodingService.getCoordinates(city));
    }
}
