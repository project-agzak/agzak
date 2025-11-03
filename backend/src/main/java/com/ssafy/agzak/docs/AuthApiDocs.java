package com.ssafy.agzak.docs;

import com.ssafy.agzak.domain.auth.dto.request.AttachGuestRequest;
import com.ssafy.agzak.domain.auth.dto.request.LoginRequest;
import com.ssafy.agzak.domain.auth.dto.request.RegisterRequest;
import com.ssafy.agzak.domain.auth.dto.request.RegisterWithGuestRequest;
import com.ssafy.agzak.domain.auth.dto.response.OkResponse;
import com.ssafy.agzak.domain.auth.dto.response.TokenResponse;
import com.ssafy.agzak.global.error.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@Tag(name = "인증", description = "회원가입 / 로그인 / 로그아웃")
public interface AuthApiDocs {

    @Operation(
            summary = "회원가입",
            description = "이메일/비밀번호 + 기본정보로 가입합니다.",
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(schema = @Schema(implementation = RegisterRequest.class),
                            examples = @ExampleObject(name="예시",
                                    value = """
                                    {
                                      "email": "user@example.com",
                                      "password": "P@ssword123!",
                                      "nickname": "아그작유저",
                                      "birthDate": "1999-09-09",
                                      "gender": "MALE",
                                      "birthTime": "07:30",
                                      "birthCity": "서울특별시"
                                    }
                                    """)
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = OkResponse.class))),
                    @ApiResponse(responseCode = "409", description = "중복 이메일/닉네임", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                    @ApiResponse(responseCode = "400", description = "유효성 검증 실패", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            }
    )
    ResponseEntity<OkResponse> register(@Valid RegisterRequest req);

    @Operation(
            summary = "게스트 정보로 회원가입",
            description = "게스트 단계에서 입력/저장된 프로필(guestId)을 사용하여 이메일/비밀번호만으로 가입하고, 즉시 토큰을 발급합니다.",
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(schema = @Schema(implementation = RegisterWithGuestRequest.class),
                            examples = @ExampleObject(name="예시",
                                    value = """
                                    {
                                      "email": "user@example.com",
                                      "password": "P@ssword123!",
                                      "guestId": "b2e4a2a6-3c04-4d7a-8d2e-7f7a1c1b8f29"
                                    }
                                    """)
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "OK - 토큰 발급", content = @Content(schema = @Schema(implementation = TokenResponse.class))),
                    @ApiResponse(responseCode = "409", description = "중복 이메일", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                    @ApiResponse(responseCode = "401", description = "게스트 정보 만료/없음", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                    @ApiResponse(responseCode = "400", description = "유효성 검증 실패", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            }
    )
    ResponseEntity<TokenResponse> registerWithGuest(@RequestBody @Valid RegisterWithGuestRequest req);

    @Operation(
            summary = "게스트 프로필 부착",
            description = "로그인한 사용자 계정에 게스트 단계의 프로필(guestId)을 병합합니다.",
            security = @SecurityRequirement(name = "BearerAuth"),
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(schema = @Schema(implementation = AttachGuestRequest.class),
                            examples = @ExampleObject(name="예시",
                                    value = """
                                    {
                                      "guestId": "b2e4a2a6-3c04-4d7a-8d2e-7f7a1c1b8f29"
                                    }
                                    """)
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "OK - 부착 완료", content = @Content(schema = @Schema(implementation = OkResponse.class))),
                    @ApiResponse(responseCode = "401", description = "인증 필요 / 게스트 정보 만료", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            }
    )
    ResponseEntity<OkResponse> attachGuest(@RequestBody @Valid AttachGuestRequest req, Authentication authentication);

    @Operation(
            summary = "로그인",
            description = "이메일/비밀번호로 로그인하여 액세스/리프레시 토큰 발급",
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(schema = @Schema(implementation = LoginRequest.class),
                            examples = @ExampleObject(value = """
                                    { "email": "user@example.com", "password": "P@ssword123!" }
                                    """)
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = TokenResponse.class))),
                    @ApiResponse(responseCode = "401", description = "인증 실패", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            }
    )
    ResponseEntity<TokenResponse> login(@Valid LoginRequest req);

    @Operation(
            summary = "로그아웃",
            description = "리프레시 토큰 삭제 및 (선택) 액세스 토큰 블랙리스트 처리",
            security = @SecurityRequirement(name = "BearerAuth"),
            parameters = @Parameter(
                    name = HttpHeaders.AUTHORIZATION,
                    description = "Bearer 액세스 토큰",
                    in = ParameterIn.HEADER,
                    required = true,
                    example = "Bearer eyJhbGciOi..."
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = OkResponse.class))),
                    @ApiResponse(responseCode = "401", description = "토큰 누락/무효", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            }
    )
    ResponseEntity<OkResponse> logout(String authHeader, Authentication authentication);
}
