// src/components/templates/MidImages34.tsx
import { FORTUNE_IMAGES } from '@/constants/fortuneImages';

type Props = {
  itemWidth?: number; // 가로 폭 (px)
  className?: string;
  whiteBg?: boolean; // 흰 배경 깔지 여부
};

export function MidImages34({ itemWidth = 300, className = '', whiteBg = true }: Props) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {FORTUNE_IMAGES.map((src, idx) => (
        <div key={idx} className={`flex justify-center ${whiteBg ? 'bg-white' : ''}`}>
          <img
            src={src}
            alt={`fortune ${idx + 1}`}
            loading="lazy"
            decoding="async"
            className="block h-auto"
            style={{ width: itemWidth }}
          />
        </div>
      ))}
    </div>
  );
}
