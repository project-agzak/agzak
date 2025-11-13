package com.ssafy.agzak.domain.gift.repository;

import com.ssafy.agzak.domain.gift.dto.response.GiftResponse;
import com.ssafy.agzak.domain.gift.entity.Gift;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import com.ssafy.agzak.domain.inventory.entity.Inventory;

import java.util.Optional;

public interface CustomGiftRepository {

    Optional<Inventory> findInventoryByMemberIdForUpdate(Long userId);

    long countCookieAvailableByInventoryId(Long inventoryId);

    Optional<Gift> findGiftByGiftIdForUpdate(Long giftId);

    Optional<FortuneCookie> findCookieByCookieIdForUpdate(Long fortuneCookieId);

    long updateStatusToPendingGift(Long cookieId, Long senderId);

    Optional<GiftResponse> getGiftDetailByGiftId(Long giftId, Long userId);
}
