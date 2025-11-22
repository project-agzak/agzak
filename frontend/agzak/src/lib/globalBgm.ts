// src/lib/globalBgm.ts
import bgmUrl from "@/assets/Sounds/Bgm.m4a";

type BgmState = {
  audio: HTMLAudioElement | null;
  initialized: boolean;
  started: boolean;
  startHandler: ((e: Event) => void) | null;
};

const bgmState: BgmState = {
  audio: null,
  initialized: false,
  started: false,
  startHandler: null,
};

function startBgm() {
  const { audio, started } = bgmState;
  if (!audio || started) return;

  bgmState.started = true;

  audio
    .play()
    .catch(() => {
      // 재생 실패(모바일 정책 등)는 조용히 무시
      bgmState.started = false;
    });
}


export function initGlobalBgm() {
  if (bgmState.initialized) return;
  bgmState.initialized = true;

  const audio = new Audio(bgmUrl);
  audio.loop = true;
  audio.volume = 0.5; // 볼륨은 취향대로
  bgmState.audio = audio;

  const handler = () => {
    startBgm();

    if (bgmState.startHandler) {
      document.removeEventListener("click", bgmState.startHandler);
      document.removeEventListener("keydown", bgmState.startHandler);
      bgmState.startHandler = null;
    }
  };

  bgmState.startHandler = handler;

  document.addEventListener("click", handler);
  document.addEventListener("keydown", handler);
}
