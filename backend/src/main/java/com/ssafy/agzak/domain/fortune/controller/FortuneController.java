package com.ssafy.agzak.domain.fortune.controller;

import com.ssafy.agzak.docs.FortuneApiDocs;
import com.ssafy.agzak.domain.fortune.service.AstrologyCalculationService;
import com.ssafy.agzak.domain.fortune.service.FortuneService;
import com.ssafy.agzak.domain.fortune.service.FortuneTypeService;
import com.ssafy.agzak.domain.fortune.service.GeocodingService;
import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.request.GuestFortuneRequest;
import com.ssafy.agzak.domain.fortune.dto.response.*;
import com.ssafy.agzak.domain.member.dto.response.MemberInfoResponse;
import com.ssafy.agzak.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/fortune")
public class FortuneController implements FortuneApiDocs {

    private final AstrologyCalculationService astrologyCalculationService;
    private final GeocodingService geocodingService;
    private final FortuneService fortuneService;
    private final FortuneTypeService fortuneTypeService;
    private final MemberService memberService;

    @PostMapping
    public ResponseEntity<FinalFortuneResponse> postMemberTodayFortune() {
        //TODO security 적용시 파라미터 변경
        //TODO 이미 운세 조회한경우 접근 차단
        long memberId = 1;
        MemberInfoResponse response = memberService.getMemberInfo(memberId);
        BirthDataInput input = BirthDataInput.fromMemberInfo(response);
        FinalFortuneResponse result = fortuneService.getFortuneScores(input);
        fortuneService.saveFortune(memberId, result);
        return ResponseEntity.ok().body(result);
    }

    @PostMapping("/guest")
    public ResponseEntity<FinalFortuneResponse> postGuestFortune(@RequestBody GuestFortuneRequest guestFortuneRequest) {
        KakaoAddressResponse.Document geo = geocodingService.getCoordinates(guestFortuneRequest.birthCity());
        BirthDataInput input = new BirthDataInput(guestFortuneRequest.birthDate(), guestFortuneRequest.birthTime(), geo.latitude(), geo.longitude());
        return ResponseEntity.ok().body(fortuneService.getFortuneScores(input));
    }


    @GetMapping("/fortuneType/{fortuneTypeId}")
    public ResponseEntity<FortuneTypeResponse> getFortuneTypeDetail(@PathVariable Long fortuneTypeId) {
        return ResponseEntity.ok().body(fortuneTypeService.getFortuneType(fortuneTypeId));
    }

    @PostMapping("/test")
    public ResponseEntity<AiPromptData> test(@RequestBody BirthDataInput test) {
        return ResponseEntity.ok().body(astrologyCalculationService.generateAiPromptData(test));
    }

    @GetMapping("/city")
    public ResponseEntity<KakaoAddressResponse.Document> testMap(@RequestParam String city) {
        return ResponseEntity.ok().body(geocodingService.getCoordinates(city));
    }
}
