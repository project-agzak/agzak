import * as React from "react";
import Rainbow from "@/assets/Gifs/Rainbow.gif";
import { ActionButton_M } from "@/components/atoms/ActionButton_M";
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";
import { CookieInventory, type CookieData } from "@/components/organisms/CookieInventory";
import InventoryImg from "@/assets/ui/CookieInventory.svg";

import HealthCookie from "@/assets/Cookies/health-cookie.svg";
import AchievementCookie from "@/assets/Cookies/achievement-cookie.svg";
import LoveCookie from "@/assets/Cookies/love-cookie.svg";
import MoneyCookie from "@/assets/Cookies/money-cookie.svg";
import MixedCookie from "@/assets/Cookies/mixed-cookie.svg";
import RottenCookie from "@/assets/Cookies/rotten-cookie.svg";

// 데모 데이터: 실제로는 API에서 주입
export const demoCookies: CookieData[] = [
  {
    id: "c1",
    imgSrc: HealthCookie,
    detail: {
      title: "건강쿠키",
      effects: [
        { label: "건강운", value: +120 },
        { label: "성취운", value: +20 },
      ],
    },
    createdAt: Date.now() - 1_000,
  },
  {
    id: "c2",
    imgSrc: AchievementCookie,
    detail: {
      title: "성취쿠키",
      effects: [
        { label: "성취운", value: +140 },
        { label: "금전운", value: +30 },
      ],
    },
    createdAt: Date.now() - 2_000,
  },
  {
    id: "c3",
    imgSrc: LoveCookie,
    detail: {
      title: "애정쿠키",
      effects: [
        { label: "애정운", value: +110 },
        { label: "건강운", value: +20 },
      ],
    },
    createdAt: Date.now() - 3_000,
  },
  {
    id: "c4",
    imgSrc: MoneyCookie,
    detail: {
      title: "금전쿠키",
      effects: [
        { label: "금전운", value: +130 },
        { label: "성취운", value: +15 },
      ],
    },
    createdAt: Date.now() - 4_000,
  },
  {
    id: "c5",
    imgSrc: MixedCookie,
    detail: {
      title: "믹스쿠키",
      effects: [
        { label: "건강운", value: +40 },
        { label: "성취운", value: +50 },
        { label: "애정운", value: +30 },
        { label: "금전운", value: +20 },
      ],
    },
    createdAt: Date.now() - 5_000,
  },
  {
    id: "c6",
    imgSrc: RottenCookie,
    detail: {
      title: "시련쿠키",
      effects: [
        { label: "성취운", value: -30 },
        { label: "금전운", value: -20 },
      ],
    },
    createdAt: Date.now() - 6_000,
  },
  {
    id: "c7",
    imgSrc: HealthCookie,
    detail: {
      title: "건강쿠키",
      effects: [
        { label: "건강운", value: +90 },
        { label: "애정운", value: +10 },
      ],
    },
    createdAt: Date.now() - 7_000,
  },
  {
    id: "c8",
    imgSrc: AchievementCookie,
    detail: {
      title: "성취쿠키",
      effects: [
        { label: "성취운", value: +120 },
        { label: "건강운", value: +10 },
      ],
    },
    createdAt: Date.now() - 8_000,
  },
  {
    id: "c9",
    imgSrc: LoveCookie,
    detail: {
      title: "애정쿠키",
      effects: [
        { label: "애정운", value: +95 },
        { label: "금전운", value: +10 },
      ],
    },
    createdAt: Date.now() - 9_000,
  },
  {
    id: "c10",
    imgSrc: MoneyCookie,
    detail: {
      title: "금전쿠키",
      effects: [
        { label: "금전운", value: +100 },
        { label: "성취운", value: +25 },
      ],
    },
    createdAt: Date.now() - 10_000,
  },
  {
    id: "c11",
    imgSrc: MixedCookie,
    detail: {
      title: "믹스쿠키",
      effects: [
        { label: "성취운", value: +40 },
        { label: "금전운", value: +40 },
        { label: "애정운", value: +20 },
      ],
    },
    createdAt: Date.now() - 11_000,
  },
  {
    id: "c12",
    imgSrc: RottenCookie,
    detail: {
      title: "시련쿠키",
      effects: [
        { label: "건강운", value: -25 },
        { label: "애정운", value: -15 },
      ],
    },
    createdAt: Date.now() - 12_000,
  },
  {
    id: "c13",
    imgSrc: HealthCookie,
    detail: {
      title: "건강쿠키",
      effects: [
        { label: "건강운", value: +110 },
        { label: "성취운", value: +10 },
      ],
    },
    createdAt: Date.now() - 13_000,
  },
  {
    id: "c14",
    imgSrc: MoneyCookie,
    detail: {
      title: "금전쿠키",
      effects: [
        { label: "금전운", value: +80 },
        { label: "애정운", value: +10 },
      ],
    },
    createdAt: Date.now() - 14_000,
  },
  {
    id: "c15",
    imgSrc: MixedCookie,
    detail: {
      title: "믹스쿠키",
      effects: [
        { label: "건강운", value: +30 },
        { label: "성취운", value: +30 },
        { label: "애정운", value: +30 },
        { label: "금전운", value: +30 },
      ],
    },
    createdAt: Date.now() - 15_000,
  },
];

export default function CookiesPage() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [cookies, setCookies] = React.useState<CookieData[]>(demoCookies);

  const selectedCookie = cookies.find((c) => c.id === selectedId) || null;

  const eatSelected = () => {
    if (!selectedCookie) return;
    // TODO: 게이지 반영 로직 (FortuneGaugeList와 상태 연동)
    // 임시로 삭제와 동일 처리
    setCookies((prev) => prev.filter((c) => c.id !== selectedCookie.id));
    setSelectedId(null);
  };

  const removeSelected = () => {
    if (!selectedCookie) return;
    setCookies((prev) => prev.filter((c) => c.id !== selectedCookie.id));
    setSelectedId(null);
  };

  return (
    <main className="relative z-10 p-4 min-h-screen">
      <div className="flex flex-row justify-center items-center">
        <img src={ Rainbow } alt="" className="w-1/2 max-w-[220px] h-auto mt-5"/>
        <div className="flex flex-col items-center pr-2 w-1/2 max-w-[220px]">
          <FortuneGaugeList />
        </div>
      </div>

      <div className="flex flex-row items-center justify-center mt-4">
        <p className="font-bitbit-large mr-5">NNN 점</p> 
        <p className="font-bitbit"> +20 점</p>
      </div>

      <div className="flex justify-center pb-2 mt-4">
        <div className="flex w-fit gap-[10px]">
          <ActionButton_M className="shrink-0 !mx-0" label="쿠키 먹기" onClick={eatSelected} disabled={!selectedCookie} />
          <ActionButton_M className="shrink-0 !mx-0" label="삭제" onClick={removeSelected} disabled={!selectedCookie} />
        </div>
      </div>

      <div className="relative mt-5">
        <img
          src={InventoryImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none pl-3 -z-10"
        />
        <CookieInventory
          items={cookies}
          selectedId={selectedId}
          onChangeSelected={setSelectedId}
          className="relative translate-y-3"
        />
      </div>
    </main>
  );
}
