package com.ssafy.agzak.domain.fortune.service;

import com.ssafy.agzak.domain.fortune.dto.response.FortuneTypeResponse;
import com.ssafy.agzak.domain.fortune.entity.FortuneType;
import com.ssafy.agzak.domain.fortune.repository.FortuneTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FortuneTypeService {
    private final FortuneTypeRepository fortuneTypeRepository;

    public FortuneTypeResponse getFortuneType(long id) {
        FortuneType type = fortuneTypeRepository.findFortuneTypeByFortuneTypeId(id)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 운세 타입 아이디입니다."));

        return FortuneTypeResponse.fromEntity(type);
    }
}
