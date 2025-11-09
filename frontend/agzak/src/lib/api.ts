
import { useAuthStore } from "@/store/useAuthStore";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { apiClient } from "./axios";

export type ApiError = { status?: number; code?: string | number; message: string; raw?: any };
export type ApiResponse<T> = {
  ok: boolean;
  data?: T | undefined;
  error?: ApiError;

};


function handleAuthError(status?: number, url?: string) {
  const { logout } = useAuthStore.getState();

  const isAuthRequest = !!url && url.startsWith("/auth/"); // /auth/* 는 건들지 않기
if (isAuthRequest || status == null) return;

    // 401: 세션 만료 등
  if (status === 401) {
    logout("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
    window.location.replace("/login");
    return;
  }

  // 400: 깨진 세션/회원 정보 문제라고 보고 처리
  if (status === 400) {
    logout("계정 정보에 문제가 있어 로그아웃되었습니다. 다시 로그인해주세요.");
    window.location.replace("/login");
    return;
  }
  
}


async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {

     const { accessToken, expiresAt, logout } = useAuthStore.getState();

     const url = typeof config.url === "string" ? config.url : "";
    const isAuthRequest = url.startsWith("/auth/");
    const isGameRequest = url.startsWith("/game/");

    // 게임 요청에 대한 상세 로깅
    if (isGameRequest) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      console.log("[API_REQUEST] 게임 API 요청:", {
        url,
        method: config.method,
        isIOS,
        hasToken: !!accessToken,
        tokenExpiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        timestamp: new Date().toISOString(),
      });
    }

if (!isAuthRequest && accessToken) {
      // 토큰 만료 체크 (프론트 기준)
      if (expiresAt && expiresAt <= Date.now()) {
        logout("세션이 만료되었습니다. 다시 로그인해주세요.");
        return {
          ok: false,
          error: {
            status: 401,
            code: 401,
            message: "세션이 만료되었습니다. 다시 로그인해주세요.",
          },
        };
      }
// 유효한 토큰이면 Authorization 헤더 추가
      config = {
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }
    const res: AxiosResponse<T> = await apiClient.request<T>(config);

    // 게임 요청 성공 로깅
    if (isGameRequest) {
      console.log("[API_RESPONSE] 게임 API 응답 성공:", {
        url,
        status: res.status,
        hasData: !!res.data,
      });
    }

    //  204 No Content → 성공으로 간주
    if (res.status === 204) {
      return { ok: true, data: undefined };
    }

    return { ok: true, data: res.data };

  } catch (e: any) {
    const status = e?.response?.status;
    const raw = e?.response?.data;
    const message = raw?.message ?? e?.message ?? "Unexpected error";
    const url = typeof config.url === "string" ? config.url : "";
    const isAuthRequest = url.startsWith("/auth/");
    const isGameRequest = url.startsWith("/game/");
    
    // 게임 요청 에러 상세 로깅
    if (isGameRequest) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      console.error("[API_ERROR] 게임 API 요청 실패:", {
        url,
        method: config.method,
        status,
        statusText: e?.response?.statusText,
        message,
        error: e?.message,
        responseData: raw,
        isIOS,
        headers: e?.response?.headers,
        timestamp: new Date().toISOString(),
      });
    }
    
    // handleAuthError는 한 번만 호출
    handleAuthError(status, url);
    
       if (!isAuthRequest && status === 500) {
      console.error("서버 오류(500) 감지됨. 홈으로 이동:", message);
      alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      window.location.replace("/"); // 새로고침 + 홈 이동
    }


    
    return { ok: false, error: { status, code: status, message, raw } };
    }
}

export const api = {
  get:  <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ url, method: "GET", ...config }),
  post: <T>(url: string, body?: any, config?: AxiosRequestConfig) =>
    request<T>({ url, method: "POST", data: body, ...config }),
  put:  <T>(url: string, body?: any, config?: AxiosRequestConfig) =>
    request<T>({ url, method: "PUT", data: body, ...config }),
  patch:<T>(url: string, body?: any, config?: AxiosRequestConfig) =>
    request<T>({ url, method: "PATCH", data: body, ...config }),
  del:  <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ url, method: "DELETE", ...config }),
};
