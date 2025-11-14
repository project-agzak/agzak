package com.ssafy.agzak.domain.gift.service;

import com.ssafy.agzak.domain.gift.dto.event.CreateGiftEvent;
import com.ssafy.agzak.domain.gift.dto.request.SendGiftRequest;
import com.ssafy.agzak.domain.gift.dto.response.GiftResponse;
import com.ssafy.agzak.domain.gift.entity.Gift;
import com.ssafy.agzak.domain.gift.entity.GiftStatus;
import com.ssafy.agzak.domain.gift.exception.*;
import com.ssafy.agzak.domain.gift.repository.CustomGiftRepository;
import com.ssafy.agzak.domain.gift.repository.GiftRepository;
import com.ssafy.agzak.domain.inventory.entity.FortuneCookie;
import com.ssafy.agzak.domain.inventory.entity.Inventory;
import com.ssafy.agzak.domain.inventory.repository.FortuneCookieRepository;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GiftService {

    private final GiftRepository giftRepository;
    private final ApplicationEventPublisher publisher;
    private final MemberRepository memberRepository;
    private final FortuneCookieRepository fortuneCookieRepository;
    private final CustomGiftRepository customGiftRepository;

    @Transactional
    public void sendGift(Long senderId, SendGiftRequest request) {
        Member sender = memberRepository.getReferenceById(senderId);
        Member receiver = memberRepository.getReferenceById(request.receiverId());
        long updated = customGiftRepository.updateStatusToPendingGift(request.cookieId(), senderId);

        if(updated == 0) {
            throw new IllegalCookieSendException("쿠키 선물에 실패했습니다.");
        }

        Gift gift = giftRepository.save(
                Gift.builder()
                        .sender(sender)
                        .receiver(receiver)
                        .fortuneCookie(fortuneCookieRepository.getReferenceById(request.cookieId()))
                        .message(request.message())
                        .status(GiftStatus.SENT)
                        .build()
        );

        publisher.publishEvent(
                CreateGiftEvent.builder()
                        .giftId(gift.getId())
                        .senderId(sender.getMemberId())
                        .receiverId(receiver.getMemberId())
                        .build()
        );
    }

    @Transactional
    public void receiveGift(Long giftId, Long userId) {
        // 선물 상태변이(SENT -> RECEIVED)
        Gift gift = customGiftRepository.findGiftByGiftIdForUpdate(giftId)
                .orElseThrow(() -> new IllegalReceiverException("해당 선물이 존재하지 않거나 받을 수 없는 선물입니다."));
        if(!gift.getReceiver().getMemberId().equals(userId)){
            throw new IllegalReceiverException("해당 선물을 받을 수 없는 사용자입니다.");
        }
        if(!gift.getStatus().equals(GiftStatus.SENT)){
            throw new AlreadyReceivedGiftException("이미 수령한 선물입니다.");
        }
        // 쿠키의 인벤토리 변경(선물받은사람의 인벤토리로)
        FortuneCookie cookie = customGiftRepository.findCookieByCookieIdForUpdate(gift.getFortuneCookie().getFortuneCookieId())
                .orElseThrow(() -> new IllegalReceiverException("해당 선물의 쿠키가 존재하지 않습니다."));
        if(!cookie.getStatus().equals(FortuneCookie.CookieStatus.PENDING_GIFT)){
            throw new IllegalReceiverException("해당 선물의 쿠키를 받을 수 없습니다.");
        }
        // 인벤토리 잠금 및 갯수 체크
        Inventory inventory = customGiftRepository.findInventoryByMemberIdForUpdate(userId)
                .orElseThrow(() -> new IllegalReceiverException("선물을 받을 수 없는 사용자입니다."));

        long count = customGiftRepository.countCookieAvailableByInventoryId(inventory.getInventoryId());
        if(count >= 50) {
            throw new InventoryOverflowException("인벤토리가 가득 찼습니다.");
        }

        // 쿠키 상태변이(PENDING_GIFT -> AVAILABLE)
        gift.receiveGift();
        cookie.changeInventory(inventory);
    }

    @Transactional(readOnly = true)
    public GiftResponse getGiftDetail(Long giftId, Long userId) {
        return customGiftRepository.getGiftDetailByGiftId(giftId, userId)
                .orElseThrow(() -> new NoSuchGiftException("해당 선물이 존재하지 않습니다."));
    }
}
