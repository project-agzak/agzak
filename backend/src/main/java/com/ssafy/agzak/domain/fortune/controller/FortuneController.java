package com.ssafy.agzak.domain.fortune.controller;

import com.ssafy.agzak.docs.FortuneApiDocs;
import com.ssafy.agzak.domain.fortune.service.AstrologyCalculationService;
import com.ssafy.agzak.domain.fortune.service.FortuneService;
import com.ssafy.agzak.domain.fortune.service.FortuneTypeService;
import com.ssafy.agzak.domain.fortune.service.GeocodingService;
import com.ssafy.agzak.domain.fortune.dto.request.BirthDataInput;
import com.ssafy.agzak.domain.fortune.dto.request.GuestFortuneRequest;
import com.ssafy.agzak.domain.fortune.dto.response.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/fortune")
public class FortuneController implements FortuneApiDocs {

    private final AstrologyCalculationService astrologyCalculationService;
    private final GeocodingService geocodingService;
    private final FortuneService fortuneService;
    private final FortuneTypeService fortuneTypeService;

    @PostMapping
    public ResponseEntity<DetailFortuneDataResponse> postMemberTodayFortune(long memberId) {
        return ResponseEntity.ok().body(new DetailFortuneDataResponse(1, "겸손하세요",1,1,
                new FortuneTypeResponse(1,"개","금전은 좋다",2,3),
                List.of(new FortuneAspectResponse("금전운",1,1))));
    }

    @PostMapping("/guest")
    public ResponseEntity<FortuneScoreResponse> postGuestFortune(@RequestBody GuestFortuneRequest guestFortuneRequest) {
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
