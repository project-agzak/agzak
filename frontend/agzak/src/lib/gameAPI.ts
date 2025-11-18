/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import type {
  GameClaimRequest,
  GameClaimResponse,
  GameTodayQuota,
} from "@/types/game";
import type {
  GameSessionStart,
  OvenAttemptRequest,
  OvenAttemptResponse,
} from "@/types/oven";

// gameAPI 전용 타입 (api.ts와 독립적으로 선언)
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { status?: number; code?: number; message?: string } }

async function wrap<T>(promise: Promise<any>): Promise<ApiResponse<T>> {
  try {
    const res = await promise
    // axios.ts가 { ok, data } 구조를 이미 반환한다면 그대로 전달
    if (res?.ok) return res as ApiResponse<T>
    // axios 순정 AxiosResponse일 경우 data를 감싸서 리턴
    if ("data" in res) return { ok: true, data: res.data as T }
    return { ok: false, error: { message: "Unexpected response structure" } }
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err.message ?? "Network error"
    const status = err?.response?.status
    return { ok: false, error: { status, message: msg } }
  }
}

export const GameAPI = {
  /** 오늘 세션 생성 or 재개 */
  startSession: async (): Promise<ApiResponse<GameSessionStart>> => {
    return wrap<GameSessionStart>(api.post("/game/sessions/start"))
  },

  /** 강화 시도 */
  attempt: async (
    body: OvenAttemptRequest
  ): Promise<ApiResponse<OvenAttemptResponse>> => {
    return wrap<OvenAttemptResponse>(api.post("/game/attempts", body))
  },

  /** 오늘 cap/remaining 확인 */
  getToday: async (): Promise<ApiResponse<GameTodayQuota>> => {
    return wrap<GameTodayQuota>(api.get("/game/today"))
  },

  /** 증빙 +1 */
  claim: async (
    body: GameClaimRequest
  ): Promise<ApiResponse<GameClaimResponse>> => {
    return wrap<GameClaimResponse>(api.post("/game/claim", body))
  },
}
