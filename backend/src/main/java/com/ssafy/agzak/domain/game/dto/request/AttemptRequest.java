package com.ssafy.agzak.domain.game.dto.request;

public record AttemptRequest(
        AttemptAspect aspectName,   // MONEY, LOVE, ACHIEVEMENT, HEALTH, MISFORTUNE
        FireType fireType           // WEAK, STRONG
) {
        public enum AttemptAspect { MONEY, LOVE, ACHIEVEMENT, HEALTH, MISFORTUNE }
        public enum FireType { WEAK, MEDIUM, STRONG }
}
