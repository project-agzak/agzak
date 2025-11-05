
import type { AxiosRequestConfig, AxiosResponse } from "axios";

import { apiClient } from "./axios";

export type ApiError = { status?: number; code?: string | number; message: string; raw?: any };
export type ApiResponse<T> = {
  ok: boolean;
  data?: T | undefined;
  error?: ApiError;
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
    const raw = e?.response?.data;
    const message = raw?.message ?? e?.message ?? "Unexpected error";
    console.warn("[API ERROR]", status, raw);
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
