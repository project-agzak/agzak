
import { useAuthStore } from "@/store/useAuthStore";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { apiClient } from "./axios";

export type ApiError = { status?: number; code?: string | number; message: string; raw?: any };
export type ApiResponse<T> = {
  ok: boolean;
  data?: T | undefined;
  error?: ApiError;
};


function handleAuthError(status?: number) {
  const { logout } = useAuthStore.getState();

  if (status === 401) {
    logout("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
  }
}
async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {

    const { accessToken, expiresAt, logout } = useAuthStore.getState();

 if (accessToken) {
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

    //  204 No Content → 성공으로 간주
    if (res.status === 204) {
      return { ok: true, data: undefined };
    }

    return { ok: true, data: res.data };

  } catch (e: any) {
    const status = e?.response?.status;
    const raw = e?.response?.data;
    const message = raw?.message ?? e?.message ?? "Unexpected error";
    
      handleAuthError(status);
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
