package com.ssafy.agzak.domain.inventory.dto.response;

import com.ssafy.agzak.domain.cookie.entity.CookieKind;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;

import java.time.LocalDateTime;

public record CookieResponse(
        long fortuneCookieId,
        long cookieKindId,
        String code,
        String name,
        String rarityCode,
        String recipe,
        String message,
        int love,
        int money,
        int achievement,
        int health,
        LocalDateTime createdAt
) {
    public static CookieResponse fromEntity(FortuneCookie fc) {
        CookieKind ck = fc.getCookieKind();
        String rarity = (ck != null && ck.getRarity() != null) ? ck.getRarity().getCode() : null;
        return new CookieResponse(
                fc.getFortuneCookieId(),
                ck != null ? ck.getCookieKindId() : 0L,
                ck != null ? ck.getCode() : null,
                ck != null ? ck.getName() : null,
                rarity,
                ck != null ? ck.getRecipe() : null,
                ck != null ? ck.getMessage() : null,
                fc.getLove(),
                fc.getMoney(),
                fc.getAchievement(),
                fc.getHealth(),
                fc.getCreatedAt()
        );
    }
}