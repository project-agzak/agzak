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

// 🔹 카카오 SDK 초기화
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_LOGIN_JS_KEY as string;

if (window.Kakao) {
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
    console.log("Kakao initialized:", window.Kakao.isInitialized());
  }
} else {
  console.warn("Kakao SDK not found on window. Check index.html script tag.");
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);
