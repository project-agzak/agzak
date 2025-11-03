// src/hooks/useKakaoSdk.ts
import { useEffect, useState } from "react";

type KakaoStatus =
  | "" // 정상
  | "ENV_MISSING"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "DOMAIN_OR_KEY_MISMATCH" // 401/403
  | "LOADING"
  | "READY";

export function useKakaoSdk(appKeyRaw?: string) {
  const appKey = (appKeyRaw ?? "").trim();
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<KakaoStatus>(appKey ? "LOADING" : "ENV_MISSING");

  useEffect(() => {
    const w = window as any;

    if (!appKey) {
      setStatus("ENV_MISSING");
      return;
    }

    // 이미 로드되어 있으면 통과
    if (w.kakao?.maps?.services) {
      setReady(true);
      setStatus("READY");
      return;
    }

    // 중복 스크립트 대응: 기존 태그를 재사용하고, load/error 이벤트를 꼭 건다
    let script = document.getElementById("kakao-sdk") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "kakao-sdk";
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    const onLoad = () => {
      if (!w.kakao?.maps) return; // 아직 파싱 전일 수 있음
      w.kakao.maps.load(() => {
        if (w.kakao?.maps?.services) {
          setReady(true);
          setStatus("READY");
        } else {
          // services 라이브러리 누락 or 도메인 문제일 때 여기까지도 못 오는 경우가 많음
          setReady(false);
          setStatus("DOMAIN_OR_KEY_MISMATCH");
        }
      });
    };

    const onError = async () => {
  try {
    await fetch(
      `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`,
      { method: "GET", mode: "no-cors" }
    );
    // no-cors 상태에서는 성공/실패 구분 불가, 일단 네트워크 요청 시도 성공으로 간주
    
  } catch (e) {
    setStatus("NETWORK_ERROR");
  }
};

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    // 8초 타임아웃: 보통 401/403/차단 시 여기서 멈춤
    const timer = setTimeout(() => {
      if (!ready) setStatus("TIMEOUT");
    }, 8000);

    return () => {
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onError);
      clearTimeout(timer);
    };
  }, [appKey]);

  return { ready, status };
}
