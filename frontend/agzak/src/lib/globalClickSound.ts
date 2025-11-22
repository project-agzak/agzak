// src/lib/globalClickSound.ts
import clickSoundUrl from "@/assets/Sounds/Click.wav";

type ClickSoundState = {
  audio: HTMLAudioElement | null;
  handler: ((e: MouseEvent) => void) | null;
  initialized: boolean;
};

// 상태를 한 객체에 모아두고, 이 객체 자체는 const (재할당 X)
const clickSoundState: ClickSoundState = {
  audio: null,
  handler: null,
  initialized: false,
};

function playClick() {
  const { audio, initialized } = clickSoundState;
  if (!initialized || !audio) return;

  try {
    audio.currentTime = 0;
    audio.play().catch(() => {
      // 모바일/브라우저 오디오 정책 때문에 실패할 수 있음 -> 조용히 무시
    });
  } catch {
    // 안전망
  }
}

/**
 * 전역 클릭 효과음 초기화
 */
export function initGlobalClickSound() {
  if (clickSoundState.initialized) return;

  clickSoundState.audio = new Audio(clickSoundUrl);
  clickSoundState.audio.volume = 0.5;

  clickSoundState.handler = (e: MouseEvent) => {
    // 왼쪽 클릭에만 반응하고 싶으면 아래 조건 유지
    if (e.button !== 0) return;
    playClick();
  };

  document.addEventListener("click", clickSoundState.handler);
  clickSoundState.initialized = true;
}
