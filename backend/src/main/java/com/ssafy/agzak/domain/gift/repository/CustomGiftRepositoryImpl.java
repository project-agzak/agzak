package com.ssafy.agzak.domain.gift.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.agzak.domain.gift.dto.response.GiftResponse;
import com.ssafy.agzak.domain.gift.entity.Gift;
import com.ssafy.agzak.domain.inventory.dto.response.CookieResponse;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie.CookieStatus;
import com.ssafy.agzak.domain.inventory.entity.Inventory;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import static com.ssafy.agzak.domain.gift.entity.QGift.gift;
import static com.ssafy.agzak.domain.inventory.entity.QFortuneCookie.fortuneCookie;
import static com.ssafy.agzak.domain.inventory.entity.QInventory.inventory;
import static com.ssafy.agzak.domain.member.entity.QMember.member;

@Repository
@RequiredArgsConstructor
public class CustomGiftRepositoryImpl implements CustomGiftRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<Inventory> findInventoryByMemberIdForUpdate(Long userId) {
        Inventory targetInv = queryFactory
                .selectFrom(inventory)
                .where(inventory.member.memberId.eq(userId))
                .setLockMode(LockModeType.PESSIMISTIC_WRITE)
                .fetchOne();

        return Optional.ofNullable(targetInv);
    }

    @Override
    public long countCookieAvailableByInventoryId(Long inventoryId) {
        Long count = queryFactory
                .select(fortuneCookie.count())
                .from(fortuneCookie)
                .where(
                        fortuneCookie.inventory.inventoryId.eq(inventoryId)
                                .and(fortuneCookie.status.eq(CookieStatus.AVAILABLE))
                )
                .fetchOne();

        return count != null ? count : 0;
    }

    @Override
    public Optional<Gift> findGiftByGiftIdForUpdate(Long giftId) {
        Gift targetGift = queryFactory
                .selectFrom(gift)
                .where(gift.id.eq(giftId))
                .setLockMode(LockModeType.PESSIMISTIC_WRITE)
                .fetchOne();

        return Optional.ofNullable(targetGift);
    }

    @Override
    public Optional<FortuneCookie> findCookieByCookieIdForUpdate(Long fortuneCookieId) {
        FortuneCookie targetCookie = queryFactory
                .selectFrom(fortuneCookie)
                .where(fortuneCookie.fortuneCookieId.eq(fortuneCookieId))
                .setLockMode(LockModeType.PESSIMISTIC_WRITE)
                .fetchOne();

        return Optional.ofNullable(targetCookie);
    }

    @Override
    public long updateStatusToPendingGift(Long cookieId, Long senderId) {
        return queryFactory
                .update(fortuneCookie)
                .set(fortuneCookie.status, CookieStatus.PENDING_GIFT)
                .where(
                        fortuneCookie.fortuneCookieId.eq(cookieId)
                                .and(fortuneCookie.status.eq(CookieStatus.AVAILABLE))
                                .and(
                                        fortuneCookie.inventory.member.memberId.eq(senderId)
                                )
                )
                .execute();
    }

    @Override
    public Optional<GiftResponse> getGiftDetailByGiftId(Long giftId, Long userId) {
        return Optional.ofNullable(queryFactory
                .select(Projections.constructor(
                        GiftResponse.class,
                        gift.id,
                        gift.sender.memberId,
                        gift.sender.nickname,
                        Projections.constructor(
                                CookieResponse.class,
                                fortuneCookie.fortuneCookieId,
                                fortuneCookie.type.stringValue(),
                                fortuneCookie.love,
                                fortuneCookie.money,
                                fortuneCookie.achievement,
                                fortuneCookie.health,
                                fortuneCookie.createdAt
                        ),
                        gift.message
                ))
                .from(gift)
                .join(gift.sender, member)
                .join(gift.fortuneCookie, fortuneCookie)
                .where(gift.id.eq(giftId).and(gift.receiver.memberId.eq(userId)))
                .fetchOne());
    }
}
