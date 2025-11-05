// src/lib/axios.ts
import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,           // 쿠키 인증이면 유지, JWT만 쓰면 있어도 무방
  headers: { "Content-Type": "application/json" },
});


// ✅ 요청 인터셉터: 토큰 붙이기
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ 응답 인터셉터: 공통 에러 처리(+토큰 재발급 자리)
let refreshing = false;
let queue: Array<() => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;

    // 토큰 만료 가정: 401 처리 (필요 없으면 이 블록 삭제)
    if (status === 401 && !refreshing) {
      refreshing = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw error;

        // ⚠️ 실제 refresh 엔드포인트로 교체
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refreshToken: refresh }
        );
        const newToken = (data as any).accessToken;
        localStorage.setItem("access_token", newToken);

        // 대기 중 요청 재시도
        queue.forEach((fn) => fn());
        queue = [];
        return apiClient(error.config!);
      } catch (e) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        // 필요하면 로그인 페이지로 이동
        // window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }

    // 401인데 이미 refresh 중이면 줄 세우기
    if (status === 401 && refreshing) {
      return new Promise((resolve) => {
        queue.push(() => resolve(apiClient(error.config!)));
      });
    }

    return Promise.reject(error);
  }
);
