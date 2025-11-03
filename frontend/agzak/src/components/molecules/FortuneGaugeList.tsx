// @/components/molecueles/FortuneGaugeList.tsx

import { FortuneGauge } from "@/components/atoms/FortuneGauge";

export function FortuneGaugeList() {
  return (
    <div className="w-full space-y-2">
      <FortuneGauge label="건강운" value={180} color="green" />
      <FortuneGauge label="성취운" value={220} color="blue" />
      <FortuneGauge label="애정운" value={120} color="pink" />
      <FortuneGauge label="금전운" value={150} color="yellow" />
    </div>
  );
}
