import { FortuneBubble } from "@/components/atoms/FortuneBubble";
import BlackboardCalendar from "@/components/molecules/CalendarBoard";
import { ExpandableFortune } from "@/components/molecules/ExpandableFortune";
import { FortuneGaugeList } from "@/components/molecules/FortuneGaugeList";
import type { FortuneCookieDetail } from "@/types/cookies";

const fortuneCookie: FortuneCookieDetail = {
  title: "건강쿠키",
  effects: [
    { label: "건강운", value: 100 },
    { label: "성취운", value: 30 },
    { label: "애정운", value: 10 },
  ],
};

export default function Page() {
  return (
    <main className="relative z-10 p-4 min-h-screen">
      <h1 className="text-xl font-semibold">페이지 타이틀</h1>
      <BlackboardCalendar />
      <FortuneGaugeList />
      <FortuneBubble {...fortuneCookie} width={90} />
      <div className="min-h-dvh bg-[#FEFBF2] px-4 py-6">
        <h1 className="text-xl font-extrabold mb-4 text-[#2A2A2A]">오늘의 운세</h1>

        <div className="space-y-3">
          <ExpandableFortune
            itemValue="health"
            label="건강운"
            value={180}
            color="green"
            description="몸 컨디션이 좋아지는 날입니다. 가벼운 운동이나 산책이 행운을 끌어옵니다."
          />

          <ExpandableFortune
            itemValue="success"
            label="성취운"
            value={220}
            color="blue"
            description="집중력이 좋고 주변에서 도와주는 사람이 생깁니다. 중요한 일을 먼저 처리해보세요."
          />

          <ExpandableFortune
            itemValue="love"
            label="애정운"
            value={130}
            color="pink"
            description="대화운이 좋아요. 솔직함이 좋은 결과로 이어질 수 있습니다."
          />

          <ExpandableFortune
            itemValue="money"
            label="금전운"
            value={150}
            color="yellow"
            description="지출은 조심, 하지만 필요한 곳에 쓰는 돈은 다시 돌아옵니다."
          />
        </div>
      </div>
    </main>
  );
}
