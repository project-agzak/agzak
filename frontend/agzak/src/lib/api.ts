
import type { AxiosRequestConfig, AxiosResponse } from "axios";

import { apiClient } from "./axios";

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string | number; message: string };
};

async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {

    const res: AxiosResponse<T> = await apiClient.request<T>(config);

    //  204 No Content → 성공으로 간주
    if (res.status === 204) {
      return { ok: true, data: undefined };
    }

    return { ok: true, data: res.data };

  } catch (e: any) {
    const status = e?.response?.status;
    const message =
      e?.response?.data?.message ||
      e?.message ||
      "요청 처리 중 오류가 발생했습니다.";
    return { ok: false, error: { code: status, message } };
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
