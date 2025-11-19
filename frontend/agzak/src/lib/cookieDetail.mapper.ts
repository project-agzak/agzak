// src/lib/mappers/cookieDetail.mapper.ts
import type { CookieDetail } from "@/lib/cookiesAPI";
import type { FortuneCookieDetail } from "@/types/cookies";

const TYPE_TITLE: Record<string, string> = {
  health: "건강쿠키",
  achievement: "성취쿠키",
  love: "애정쿠키",
  money: "금전쿠키",
  mix: "믹스쿠키",
  rotten: "썩은쿠키",
  gloomy: "먹구름쿠키",
  sansam: "산삼쿠키",
  developer: "개발자쿠키",
  lava: "용암쿠키",
  santa: "산타쿠키",
  unicorn: "유니콘쿠키",
  lucky: "럭키쿠키",
};

export function toFortuneCookieDetail(dto: CookieDetail): FortuneCookieDetail {
  const title = TYPE_TITLE[dto.code] ?? dto.code;

  // UI 노출 순서(기획 기준): 건강 → 성취 → 애정 → 금전
  return {
    title,
    effects: [
      { label: "건강운", value: dto.health },
      { label: "성취운", value: dto.achievement },
      { label: "애정운", value: dto.love },
      { label: "금전운", value: dto.money },
    ],
  };
}
