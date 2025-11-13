// src/store/useHomeStore.ts
import { create } from "zustand";
import { useFortuneStore } from "./useFortuneStore";

type HomeStoreState = {
  // 홈 진입 시 오늘 운세 로딩 여부
  loadingToday: boolean;
  // 홈에서 보여줄 에러 메시지 (선택)
  errorToday: string | null;

  /**
   * 홈 진입 초기화:
   * - useFortuneStore.fetchToday() 호출
   * - 그 동안 HomeLoading 띄우기 위한 로딩 상태 관리
   */
  initHome: () => Promise<void>;
  resetHome: () => void;
};

export const useHomeStore = create<HomeStoreState>((set) => ({
  loadingToday: false,
  errorToday: null,

  initHome: async () => {
    set({ loadingToday: true, errorToday: null });

    try {
      // ✅ Fortune 스토어의 fetchToday() 호출
      const { fetchToday } = useFortuneStore.getState();
      await fetchToday();

      // Fortune 쪽 에러를 홈 에러로도 복사해두고 싶다면:
      const fortuneError = useFortuneStore.getState().error;
      if (fortuneError) {
        set({ errorToday: fortuneError });
      }
    } catch (e: any) {
      console.error("Home init 실패:", e);
      set({
        errorToday: e?.message ?? "홈 데이터를 불러오지 못했어요.",
      });
    } finally {
      // 성공/실패 상관 없이 로딩 종료
      set({ loadingToday: false });
    }
  },

  resetHome: () => set({ loadingToday: false, errorToday: null }),
}));
