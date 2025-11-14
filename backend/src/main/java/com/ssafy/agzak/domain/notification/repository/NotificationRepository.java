package com.ssafy.agzak.domain.notification.repository;

import com.ssafy.agzak.domain.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByMember_MemberIdAndReadAtIsNullAndIsDeletedFalse(Long memberId);
}
