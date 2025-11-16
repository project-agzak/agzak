import { api } from "@/lib/api";

export type FortuneShareLinkResponse = {
  url: string;
  expiresAtMillis: number;
};

function normalizeFortuneShareUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    const token = u.pathname.split("/").pop(); // 마지막 segment
    if (!token) return rawUrl;

    const origin =
      typeof window !== "undefined"
        ? window.location.origin // 예: https://www.agzak.co.kr, http://localhost:5173
        : "";

    return `${origin}/share/fortune/${token}`;
  } catch {
    return rawUrl;
  }
}

export async function issueFortuneShareLink() {
  const res = await api.post<FortuneShareLinkResponse>("/fortune/share", {});
  if (!res.ok || !res.data) {
    throw new Error("운세 공유 링크 발급 실패");
  }

  const normalizedUrl = normalizeFortuneShareUrl(res.data.url);

  return {
    ...res.data,
    url: normalizedUrl,
  };
}