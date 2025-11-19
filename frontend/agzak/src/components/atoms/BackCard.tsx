import BackBG from '@/assets/ui/Back.svg';
import clsx from 'clsx';

import { useFortuneStore } from '@/store/useFortuneStore';

import BackCat from '@/assets/BackEmoji/BackCat.svg';
import BackChicken from '@/assets/BackEmoji/BackChicken.svg';
import BackCow from '@/assets/BackEmoji/BackCow.svg';
import BackDog from '@/assets/BackEmoji/BackDog.svg';
import BackDragon from '@/assets/BackEmoji/BackDragon.svg';
import BackHorse from '@/assets/BackEmoji/BackHorse.svg';
import BackMonkey from '@/assets/BackEmoji/BackMonkey.svg';
import BackMouse from '@/assets/BackEmoji/BackMouse.svg';
import BackRabbit from '@/assets/BackEmoji/BackRabbit.svg';
import BackSheep from '@/assets/BackEmoji/BackSheep.svg';
import BackSnake from '@/assets/BackEmoji/BackSnake.svg';
import BackTiger from '@/assets/BackEmoji/BackTiger.svg';

type SummaryKey = 'total' | 'health' | 'achievement' | 'love' | 'money';

type Props = {
  className?: string;
  title?: string;
  message?: string;
  summary?: SummaryKey;
  animalSrc?: string;
};

const BACK_EMOJI_BY_TYPE: Record<string, string> = {
  쥐: BackMouse,
  소: BackCow,
  호랑이: BackTiger,
  토끼: BackRabbit,
  뱀: BackSnake,
  말: BackHorse,
  양: BackSheep,
  원숭이: BackMonkey,
  닭: BackChicken,
  개: BackDog,
  용: BackDragon,
  고양이: BackCat,
};

export default function BackCard({
  className,
  title = '오늘의 운세 한마디',
  message,
  summary = 'total',
  animalSrc,
}: Props) {
  const getTotalSummary = useFortuneStore((s) => s.getTotalSummary);
  const getDetailSummary = useFortuneStore((s) => s.getDetailSummary);
  const typeName = useFortuneStore((s) => s.typeInfo?.name ?? null);

  const resolvedMessage =
    message ??
    (summary === 'total'
      ? (getTotalSummary() ?? '')
      : (getDetailSummary(summary as Exclude<SummaryKey, 'total'>) ?? ''));

  const resolvedAnimal = animalSrc || (typeName ? BACK_EMOJI_BY_TYPE[typeName] : BackRabbit);

  return (
    <div className={clsx('relative w-full h-full', className)}>
      {/* 배경 */}
      <img
        src={BackBG}
        alt="card back background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 내용 */}
      <div className="relative h-full w-full flex flex-col items-center">
        {/* 상단 타이틀 */}
        <div className="pt-6 px-6 w-full text-center">
          <h2 className="font-bitbit tracking-wider leading-none">{title}</h2>
        </div>

        {/* 동물 아이콘 */}
        <div className="flex-1 w-full grid place-items-center">
          <img
            src={resolvedAnimal}
            alt=""
            className="w-[38%] max-w-[140px] h-auto object-contain [image-rendering:pixelated]"
          />
        </div>

        {/* 메시지 카드 */}
        <div className="w-full px-6 pb-8">
          <div className="bg-[#EED0A4]/90 rounded-md shadow-sm px-5 py-4">
            <p className="font-galmuri-condensed-small text-[#121212] leading-[1.8]">
              {resolvedMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
