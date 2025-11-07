package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.fortune.dto.request.GuestFortuneRequest;
import com.ssafy.agzak.domain.fortune.dto.response.FinalFortuneResponse;
import com.ssafy.agzak.domain.fortune.dto.response.FortuneTypeResponse;
import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import com.ssafy.agzak.domain.fortune.dto.response.GuestFortuneWithIdResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "운세 확인", description = "운세 확인 API")
public interface FortuneApiDocs {

    @Operation(
            summary = "회원 오늘의 운세 생성/조회",
            description = "인증된 회원의 오늘 운세를 계산해 저장 후 반환합니다.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = FinalFortuneResponse.class),
                    examples = @ExampleObject(
                            name = "운세 생성",
                            value = """
                                    {
                                        "scores": {
                                            "total_score": 689,
                                            "love": 172,
                                            "health": 134,
                                            "money": 184,
                                            "achievement": 199,
                                            "total_summary": "오늘은 긍정적인 어스펙트들이 주로 작용하여 다양한 영역에서 좋은 결과를 기대할 수 있는 날입니다. 다만, 몇몇 부정적인 영향도 있는 만큼 주의를 기울이는 것이 좋겠습니다.",
                                            "detailed_summaries": {
                                                "love": "오늘의 연애운은 낙관적입니다. 금성이 Libra에 있어 관계의 조화로움을 느끼기 좋고, Mars의 영향으로 진정성이 더해집니다.",
                                                "health": "건강운은 큰 무리 없이 원활히 흐르고 있습니다. 그러나 Saturn의 Opposition 영향으로 스스로의 한계를 넘어서는 일은 피하는 것이 좋습니다.",
                                                "money": "오늘 금전운은 풍족합니다. 특히 Moon과 Jupiter의 Conjunction은 당신에게 재정적으로 행운을 더해줄 것입니다.",
                                                "achievement": "성취운에서는 자신감을 갖고 행동하기 좋은 날입니다. Mercury와 Sun의 긍정적인 어스펙트가 당신의 노력에 힘을 실어줄 것입니다."
                                            }
                                        },
                                        "type": {
                                            "id": 9,
                                            "name": "닭",
                                            "goodWithId": 12,
                                            "badWithId": 1
                                        }
                                    }
                                    """
                    ))),
            @ApiResponse(responseCode = "401", description = "인증 필요",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<FinalFortuneResponse> postMemberTodayFortune();

    @Operation(
            summary = "게스트 운세 조회",
            description = "가입 없이 입력한 출생정보로 운세 계산 후 guestId를 발급합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = GuestFortuneWithIdResponse.class),
                    examples = @ExampleObject(
                            name = "게스트 조회 시 결과",
                            value = """
                            {
                                "fortune": {
                                    "scores": {
                                        "total_score": 529,
                                        "love": 142,
                                        "health": 98,
                                        "money": 122,
                                        "achievement": 167,
                                        "total_summary": "오늘은 다양한 어스펙트에 의해 복합적인 영향을 받는 날입니다. 긍정적인 면과 부정적인 면이 교차하는 가운데, 연애와 성취 측면에서 희망이 보이지만 금전과 건강에선 주의가 필요합니다.",
                                        "detailed_summaries": {
                                            "love": "연애운은 긍정적인 어스펙트 덕분에 다소 안정적입니다. 그러나 세부적인 문제에 집중하여 갈등을 해결하려는 노력이 필요합니다.",
                                            "health": "건강운은 다소 불안정한 상태입니다. 스트레스를 줄이고 충분한 휴식을 취해야 하는 날입니다.",
                                            "money": "금전운은 여러 부정적 어스펙트로 인해 주의가 필요합니다. 지출을 줄이고 재정 관리를 철저히 해야 합니다.",
                                            "achievement": "성취운은 긍정적인 에너지가 발휘되는 분야입니다. 목표를 명확히 하고 이에 집중하면 좋은 결과를 기대할 수 있는 날입니다."
                                        }
                                    },
                                    "type": {
                                        "id": 9,
                                        "name": "닭",
                                        "goodWithId": 12,
                                        "badWithId": 1
                                    }
                                },
                                "guestId": "9c5c925e-4bae-4a3c-a2d4-8e8872eddcc3"
                            }
                            """
                    ))),
            @ApiResponse(responseCode = "400", description = "도시 입력 오류/좌표 변환 실패",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<GuestFortuneWithIdResponse> postGuestFortune(@RequestBody GuestFortuneRequest guestFortuneRequest);

    @Operation(
            summary = "운세 타입 상세 조회",
            description = "운세 카드(동물/설명) 상세 정보 조회",
            parameters = @Parameter(name = "fortuneTypeId", in = ParameterIn.PATH, required = true, example = "1")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = FortuneTypeResponse.class),
                    examples = @ExampleObject(
                            name = "12가지 중 특정 운세 타입 상세 조회",
                            value = """
                            {
                                "id": 1,
                                "name": "소",
                                "goodWithId": 4,
                                "badWithId": 9
                            }
                            """
                    ))),
            @ApiResponse(responseCode = "404", description = "해당 운세 타입 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<FortuneTypeResponse> getFortuneTypeDetail(@PathVariable Long fortuneTypeId);
}
