package com.ssafy.agzak.domain.game.dto.request;

public record AttemptRequest(
        Long gameSessionId,
        AspectName aspectName,
        FireType fireType,
        Boolean deterministic               // true면 applied>=50 성공, 아니면 난수
) {
        public enum AspectName { MONEY, LOVE, ACHIEVEMENT, HEALTH }
        public enum FireType { WEAK, STRONG }
}
