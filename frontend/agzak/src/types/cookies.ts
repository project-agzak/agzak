// @/types/cookies.ts

export type FortuneEffect = {
  label: string;
  value: number;
};

export type FortuneCookieDetail = {
  /** 쿠키 이름 ex) 건강쿠키 */
  title: string;
  /** 먹었을 때 효능 */
  effects: FortuneEffect[];
};