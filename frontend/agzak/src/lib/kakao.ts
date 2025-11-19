// src/lib/kakao.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// 타입 보강 안 쓸 거면 이거 아예 제거해도 됨
// declare global { interface Window { Kakao?: any } }

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_LOGIN_JS_KEY; // 실제 .env 이름에 맞춰서 하나만!

export function getKakao() {
  if (typeof window === "undefined") return null;

  const kakao = (window as any).Kakao;
  if (!kakao) return null;

  // 초기화되지 않았으면 여기서 한 번만 init
  if (!kakao.isInitialized()) {
    if (!KAKAO_JS_KEY) {
      console.warn("[KAKAO] VITE_KAKAO_JS_KEY가 설정되지 않았습니다.");
      return null;
    }
    try {
      kakao.init(KAKAO_JS_KEY);
      console.log("[KAKAO] initialized");
    } catch (e) {
      console.error("[KAKAO] init error", e);
      return null;
    }
  }

  return kakao;
}

export function shareKakaoFeed(params: {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}) {
  const kakao = getKakao();
  if (!kakao) {
    alert("카카오 SDK 로딩 중입니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: params.title,
      description: params.description,
      imageUrl: params.imageUrl,
      link: {
        mobileWebUrl: params.url,
        webUrl: params.url,
      },
    },
    buttons: [
      {
        title: "아그작에서 보기",
        link: {
          mobileWebUrl: params.url,
          webUrl: params.url,
        },
      },
    ],
  });
}
