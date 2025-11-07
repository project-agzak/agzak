import { loadAnalytics } from "@/lib/analytics";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "../pwa/registerSW";
import "../styles/index.css";
import { router } from "./router";

// 🔹 전역 window.Kakao 타입 선언
declare global {
  interface Window {
    Kakao: any;
  }
}

// 🔹 카카오 JS SDK 초기화 (로그인용)
const rawKey = import.meta.env.VITE_KAKAO_LOGIN_JS_KEY;
const KAKAO_JS_KEY = (rawKey ?? "").trim();

if (!KAKAO_JS_KEY) {
  console.error(" VITE_KAKAO_LOGIN_JS_KEY가 비어있어요. .env 설정 확인 필요");
} else if (window.Kakao) {
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
    console.log(" Kakao initialized:", window.Kakao.isInitialized());
  }
} else {
  console.warn(" window.Kakao가 없습니다. index.html에 로그인 SDK 스크립트 추가됐는지 확인해주세요.");
}

const ENABLE_ANALYTICS = String(import.meta.env.VITE_ENABLE_ANALYTICS).toLowerCase() === "true";
if (ENABLE_ANALYTICS) loadAnalytics();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);
