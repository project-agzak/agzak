// src/hooks/useKakaoSdk.ts
import { useEffect, useState } from "react";

type KakaoStatus =
  | "" // 정상
  | "ENV_MISSING"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "DOMAIN_OR_KEY_MISMATCH" // 401/403 느낌
  | "LOADING"
  | "READY";

export function useKakaoSdk(appKeyRaw?: string) {
  const appKey = (appKeyRaw ?? "").trim();
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<KakaoStatus>(
    appKey ? "LOADING" : "ENV_MISSING"
  );

  useEffect(() => {
    const w = window as any;

    if (!appKey) {
      setStatus("ENV_MISSING");
      return;
    }

    // 이미 kakao.maps.services 가 있으면 바로 성공 처리
    if (w.kakao?.maps?.services) {
      setReady(true);
      setStatus("READY");
      return;
    }

    let script = document.getElementById("kakao-sdk") as
      | HTMLScriptElement
      | null;

    const onLoad = () => {
      if (!w.kakao?.maps) return;

      w.kakao.maps.load(() => {
        if (w.kakao?.maps?.services) {
          setReady(true);
          setStatus("READY");
        } else {
          setReady(false);
          setStatus("DOMAIN_OR_KEY_MISMATCH");
        }
      });
    };

    const onError = () => {
      setReady(false);
      setStatus("NETWORK_ERROR");
    };

    if (!script) {
      // 처음 로드
      script = document.createElement("script");
      script.id = "kakao-sdk";
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
      script.async = true;
      // ❌ CORS 터트리던 원인이라 제거
      // script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // 새로 만들었든, 이미 있던 태그든 이벤트만 걸어두기
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    // 8초 타임아웃
    const timer = setTimeout(() => {
      if (!ready && status === "LOADING") {
        setStatus("TIMEOUT");
      }
    }, 8000);

    return () => {
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onError);
      clearTimeout(timer);
    };
  }, [appKey]);

  return { ready, status };
}
