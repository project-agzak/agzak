/* eslint-disable @typescript-eslint/no-explicit-any */
export { };

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;

    hj?: (...args: any[]) => void;
    _hjSettings?: { hjid: number };

    // 핫자 최신 CDN (contentsquare) 사용 여부와 무관 — 로더가 값을 채움
  }
}
