// src/lib/axios.ts
import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,           // 쿠키 인증이면 유지, JWT만 쓰면 있어도 무방
  headers: { "Content-Type": "application/json" },
});


// 인터셉터 아예 최소화
apiClient.interceptors.request.use((config) => config);
apiClient.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);



apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
  
  
    return Promise.reject(error);
  }
);

