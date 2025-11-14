import { api } from "@/lib/api";

export type FortuneShareLinkResponse = {
  url: string;
  expiresAtMillis: number;
};

export async function issueFortuneShareLink() {
  const res = await api.post<FortuneShareLinkResponse>("/fortune/share", {});
  if (!res.ok || !res.data) {
    throw new Error("운세 공유 링크 발급 실패");
  }
  return res.data;
}
