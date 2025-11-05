// src/lib/api.ts
import type { AxiosRequestConfig } from "axios";
import { apiClient } from "./axios";

export type ApiError = { status?: number; code?: string | number; message: string; raw?: any };
export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: ApiError };

async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const { data } = await apiClient.request<T>(config);
    return { ok: true, data };
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
