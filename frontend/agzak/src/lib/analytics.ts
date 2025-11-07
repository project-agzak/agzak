// 공통 로더 & 트래커 (GA4 + Hotjar)
// Vite env
const GA_ID = import.meta.env.VITE_GA_ID;
const HJ_ID = Number(import.meta.env.VITE_HJ_ID);
const ENABLE = String(import.meta.env.VITE_ENABLE_ANALYTICS).toLowerCase() === "true";

/** 페이지 최초 1회 호출 */
export function loadAnalytics() {
  if (!ENABLE) return;
  
  // ========== GA4 loader ==========
  if (GA_ID && !window.gtag) {
      // dataLayer
      window.dataLayer = window.dataLayer || [];
      // gtag shim
      window.gtag = function () {
      // @ts-ignore
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      // 디버그뷰 확인 편의 옵션
      send_page_view: false,      // SPA 수동 전송
      debug_mode: true,
    });

    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
  }

  // ========== Hotjar loader (Contentsquare CDN) ==========
  if (HJ_ID && !window.hj) {
    // 공식 최신 스니펫 변형(타입 안전)
    (function (c: any, s: Document, q: string, u: string, a: number) {
      c.hj =
        c.hj ||
        function () {
          (c.hj.q = c.hj.q || []).push(arguments);
        };
      c._hjSettings = { hjid: a };

      const head = s.getElementsByTagName("head")[0];
      const e = s.createElement("script");
      e.async = true;
      e.src = q + c._hjSettings.hjid + u; // https://static.hj.contentsquare.net/c/csq-<id>.js
      head.appendChild(e);
    })(window, document, "https://static.hj.contentsquare.net/c/csq-", ".js", HJ_ID);
  }
}

/** 라우트 변경 시 */
export function pageview(path: string) {
  if (!ENABLE) return;
  // GA4
  if (window.gtag && GA_ID) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: location.origin + path,
    });
  }
  // Hotjar SPA 라우팅 알림
  window.hj?.("stateChange", path);
}

/** 공통 이벤트 */
export function trackEvent(name: string, params?: Record<string, any>) {
  if (!ENABLE) return;
  window.gtag?.("event", name, sanitize(params));
  // 핫자 커스텀 이벤트(필터/분석에 사용)
  window.hj?.("event", name);
}

/** 예외/실패 로깅 */
export function trackError(name: string, message?: string, ctx?: Record<string, any>) {
  if (!ENABLE) return;
  window.gtag?.("event", "exception", {
    description: message ?? name,
    fatal: false,
    ...sanitize(ctx),
  });
  window.hj?.("event", `error:${name}`);
}

/** 유저 속성 (원하면 사용) */
export function setUser(id?: string | number, props?: Record<string, any>) {
  if (!ENABLE) return;
  if (id != null) window.gtag?.("set", { user_id: String(id) });
  if (props) window.gtag?.("set", sanitize(props));
  if (props?.role) window.hj?.("tagRecording", [String(props.role)]);
}

// 객체 파라미터는 문자열화해서 GA에 안전 전송
function sanitize(obj?: Record<string, any>) {
  if (!obj) return undefined;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = typeof v === "object" ? JSON.stringify(v) : v;
  }
  return out;
}
