package com.ssafy.agzak.domain.member.entity;

import com.ssafy.agzak.domain.fortune.dto.response.LatLng;
import com.ssafy.agzak.domain.member.dto.request.MemberEditRequest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Entity
@Table(
        name = "member",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_member_nickname", columnNames = {"nickname"})
        }
)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "nickname", nullable = false, length = 50)
    private String nickname;

    @Column(name = "email")
    private String email;

    @Column(name = "password")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, length = 50)
    private Gender gender;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "birth_time", nullable = false)
    private LocalTime birthTime;

    @Column(name = "birth_city", length = 100)
    private String birthCity;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private MemberStatus status;

    public enum Gender { MALE, FEMALE }

    public enum MemberStatus { ACTIVE, WITHDRAWN }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updateInfo(MemberEditRequest request) {
        this.gender = request.gender();
        this.birthDate = request.birthDate();
        this.birthTime = request.birthTime();
        this.birthCity = request.birthCity();
    }

    public void updateLatlng(LatLng request) {
        this.latitude = request.latitude();
        this.longitude = request.longitude();
    }

    public void deleteMember() {
        this.status = MemberStatus.WITHDRAWN;
    }
}
