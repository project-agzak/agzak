// src/lib/AuthAPI.ts
import { api } from "./api";

/* ===========================
 *  공통 토큰 응답 타입
 * =========================== */
export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

/* ===========================
 *  공통 상태/메시지 응답 타입
 *  (회원가입, 로그아웃 등)
 * =========================== */
export type StatusMessageRes = {
  status: string;
  message: string;
};

/* ===========================
 *  1) 이메일/비밀번호 로그인
 *  POST /api/v1/auth/login
 * =========================== */
export type LoginReq = {
  email: string;
  password: string;
};

export type LoginRes = TokenResponse;

/* ===========================
 *  2) 일반 회원가입
 *  POST /api/v1/auth/register
 * =========================== */
export type RegisterReq = {
  email: string;
  password: string;
  nickname: string;
  birthDate: string;  // "1999-09-09"
  gender: "MALE" | "FEMALE";
  birthTime: string;  // "07:30"
  birthCity: string;  // "서울특별시"
};

export type RegisterRes = StatusMessageRes;

/* ===========================
 *  3) 게스트 기반 회원가입
 *  POST /api/v1/auth/register/with-guest
 * =========================== */
export type RegisterWithGuestReq = {
  email: string;
  password: string;
  guestId: string;
};

export type RegisterWithGuestRes = TokenResponse;

/* ===========================
 *  4) 카카오 로그인 시작
 *  POST /api/v1/auth/kakao/login
 * =========================== */
export type KakaoLoginReq = {
  authCode: string;
  redirectUri: string;
  guestId?: string; // optional-guest-id
};

export type KakaoLoginRes = {
  success: boolean;
  reason: string;         // 예: "OK", "NEED_ADDITIONAL_INFO" 등
  tokens?: TokenResponse; // 바로 로그인 성공 시 내려올 수 있음
  ticket?: string;        // 추가 정보 필요 시 사용
  email?: string;
  suggestedNickname?: string;
};

/* ===========================
 *  5) 카카오 회원가입/완료
 *  POST /api/v1/auth/kakao/complete
 * =========================== */
export type KakaoCompleteReq = {
  ticket: string;
  nickname: string;
  gender: "MALE" | "FEMALE";
  birthDate: string;   // "1999-09-09"
  birthTime: string;   // "07:30"
  birthCity: string;   // "서울특별시"
};

export type KakaoCompleteRes = TokenResponse;

/* ===========================
 *  6) 로그아웃
 *  POST /api/v1/auth/logout
 *  응답: { status, message }
 * =========================== */
// 별도 Req 타입은 없음 (헤더 Authorization 으로 처리)

/* ===========================
 *  AuthAPI — 인증 관련 전부 여기
 * =========================== */
export const AuthAPI = {


  /** 🔄 토큰 재발급 (액세스 토큰 만료 시)
 *  POST /api/v1/auth/refresh
 *  Headers: { "X-Refresh-Token": refreshToken }
 */
  refresh: (refreshToken: string) =>
    api.post<TokenResponse>(
      "/auth/refresh",
      {},
      {
        headers: {
          "X-Refresh-Token": refreshToken,
        },
      }
    ),


  /** 이메일/비밀번호 로그인
   *  POST /api/v1/auth/login
   */
  login: (body: LoginReq) => api.post<LoginRes>("/auth/login", body),

  /** 일반 회원가입
   *  POST /api/v1/auth/register
   */
  register: (body: RegisterReq) =>
    api.post<RegisterRes>("/auth/register", body),

  /** 게스트 기반 회원가입 + 즉시 토큰 발급
   *  POST /api/v1/auth/register/with-guest
   */
  registerWithGuest: (body: RegisterWithGuestReq) =>
    api.post<RegisterWithGuestRes>("/auth/register/with-guest", body),

  /** 카카오 로그인 시작
   *  POST /api/v1/auth/kakao/login
   */
  kakaoLogin: (body: KakaoLoginReq) =>
    api.post<KakaoLoginRes>("/auth/kakao/login", body),

  /** 카카오 회원가입/완료
   *  POST /api/v1/auth/kakao/complete
   */
  kakaoComplete: (body: KakaoCompleteReq) =>
    api.post<KakaoCompleteRes>("/auth/kakao/complete", body),

  /** 로그아웃
   *  POST /api/v1/auth/logout
   *  Authorization: Bearer 액세스 토큰
   */
  logout: () => api.post<StatusMessageRes>("/auth/logout"),

  /** (선택) 내 정보 — 서버 스펙에 맞춰서 수정 가능 */
  me: () => api.get<{ id: number; nickname: string }>("/users/me"),
};
