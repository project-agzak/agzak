package com.ssafy.agzak.domain.notification.service;

import com.ssafy.agzak.domain.gift.dto.event.CreateGiftEvent;
import com.ssafy.agzak.domain.member.entity.Member;
import com.ssafy.agzak.domain.member.repository.MemberRepository;
import com.ssafy.agzak.domain.notification.dto.response.NotificationResponse;
import com.ssafy.agzak.domain.notification.entity.NotiType;
import com.ssafy.agzak.domain.notification.entity.Notification;
import com.ssafy.agzak.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MemberRepository memberRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCreateGiftNotificationEvent(CreateGiftEvent event) {
        Member member = memberRepository.getReferenceById(event.getReceiverId());
        Notification notification = Notification.builder()
                .member(member)
                .notiType(NotiType.GIFT_RECEIVED)
                .refId(event.getGiftId())
                .message(NotiType.GIFT_RECEIVED.getMessage())
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(Long memberId) {
        List<Notification> notifications  = notificationRepository
                .findAllByMember_MemberIdAndReadAtIsNullAndIsDeletedFalse(memberId);

        return notifications.stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public void markNotificationAsRead(Long notificationId, Long memberId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 알림 아이디입니다."));
        if (!notification.getMember().getMemberId().equals(memberId)) {
            throw new IllegalArgumentException("본인의 알림만 읽음 처리할 수 있습니다.");
        }
        notification.markAsRead();
    }
}
