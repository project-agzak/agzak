package com.ssafy.agzak.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AttachGuestRequest(@NotBlank String guestId) {}
