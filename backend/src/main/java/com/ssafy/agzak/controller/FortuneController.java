package com.ssafy.agzak.controller;

import com.ssafy.agzak.dto.request.GuestFortuneRequest;
import com.ssafy.agzak.dto.response.DetailFortuneDataResponse;
import com.ssafy.agzak.dto.response.FortuneAspectResponse;
import com.ssafy.agzak.dto.response.FortuneTypeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fortune")
public class FortuneController {

    @PostMapping
    public ResponseEntity<DetailFortuneDataResponse> postMemberTodayFortune() {
        return ResponseEntity.ok().body(new DetailFortuneDataResponse(1, "겸손하세요",1,1,
                new FortuneTypeResponse(1,"개","금전은 좋다",2,3),
                List.of(new FortuneAspectResponse("금전운",1,1))));
    }

    @PostMapping("/guest")
    public ResponseEntity<DetailFortuneDataResponse> postGuestFortune(@RequestBody GuestFortuneRequest guestFortuneRequest) {
        return ResponseEntity.ok().body(new DetailFortuneDataResponse(1, "겸손하세요",1,1,
                new FortuneTypeResponse(1,"개","금전은 좋다",2,3),
                List.of(new FortuneAspectResponse("금전운",1,1))));
    }

    @GetMapping("/fortuneType/{fortuneTypeId}")
    public ResponseEntity<FortuneTypeResponse> getFortuneTypeDetail(@PathVariable Long fortuneTypeId) {
        return ResponseEntity.ok().body(new FortuneTypeResponse(1, "고양이", "건강 다운", 2L, 3L));
    }

}
