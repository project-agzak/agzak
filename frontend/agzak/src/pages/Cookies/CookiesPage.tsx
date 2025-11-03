import * as React from "react";
import Rainbow from "@/assets/Gifs/Rainbow.gif";
import { Button_M } from "@/components/atoms/Button_M";
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";
import { CookieInventory, type CookieData } from "@/components/organisms/CookieInventory";
import InventoryImg from "@/assets/ui/CookieInventory.svg";

// 데모 데이터: 실제로는 API에서 주입
const demoCookies: CookieData[] = [
  {
    id: "c1",
    imgSrc: "/images/cookies/clover-green.png",
    detail: {
      title: "건강쿠키",
      effects: [
        { label: "건강운", value: +100 },
        { label: "성취운", value: +30 },
        { label: "애정운", value: +10 },
      ],
    },
    createdAt: Date.now() - 1000,
  },
  {
    id: "c2",
    imgSrc: "/images/cookies/clover-yellow.png",
    detail: {
      title: "성취쿠키",
      effects: [
        { label: "성취운", value: +120 },
        { label: "금전운", value: +20 },
      ],
    },
    createdAt: Date.now() - 2000,
  },
  {
    id: "c3",
    imgSrc: "/images/cookies/clover-black.png",
    detail: {
      title: "시련쿠키",
      effects: [
        { label: "성취운", value: -20 },
        { label: "금전운", value: -10 },
      ],
    },
    createdAt: Date.now() - 3000,
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

      <div className="flex flex-row mt-4">
        <Button_M label="쿠키 먹기"  onClick={eatSelected} disabled={!selectedCookie} />
        <Button_M label="삭제" onClick={removeSelected} disabled={!selectedCookie} />
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
