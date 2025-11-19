package com.ssafy.agzak.domain.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterWithGuestRequest(
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotBlank String guestId
) {}