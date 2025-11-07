// src/lib/authUtils.ts
export function isAccessTokenExpired(): boolean {
  const expRaw = localStorage.getItem("access_token_expires_at");
  if (!expRaw) return true; // 없으면 만료로 간주

  const exp = Number(expRaw);
  if (Number.isNaN(exp)) return true;

  return Date.now() > exp;
}
