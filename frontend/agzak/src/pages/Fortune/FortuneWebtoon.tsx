// src/pages/Fortune/FortuneWebtoonPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button_L } from '@/components/atoms/Button_L';
import { MidImages34 } from '@/components/template/MidImages34';

import { useFortuneStore } from '@/store/useFortuneStore';
import SadCharacter from '@/assets/ui/sad.webp';

export default function FortuneWebtoonPage() {
  const navigate = useNavigate();

  // 이미 이전 페이지에서 fetchGuest로 채워진 운세 데이터
  const scores = useFortuneStore((s) => s.scores);
  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => {
    if (submitting) return; // 중복 클릭 방지
    setSubmitting(true);

    // 혹시 새로고침 등으로 scores가 날아간 경우 방어
    if (!scores) {
      alert('운세 정보가 없어 처음 페이지로 돌아갑니다.');
      navigate('/fortune');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    navigate('/fortune/result');
  };

  return (
    <main className="relative z-10 p-4 min-h-screen">
      {/* 하단 버튼 */}
      <div className="mt-15 flex justify-center pb-15">
        <Button_L label="운세 카드 확인" width={260} onClick={handleNext} />
      </div>

      {/*  캐릭터 + 말풍선 */}
      <div className="flex flex-col items-center mt-20 mb-1">
        <div className="relative flex flex-col items-center">
          {/* 픽셀 말풍선 */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div
              className="relative bg-white border-4 border-[#121212] shadow-[4px_4px_0_#121212]
                   px-3 py-2 font-galmuri-small text-[12px] text-[#121212]
                   text-center min-w-[200px] max-w-[260px] leading-tight
                   [image-rendering:pixelated] pixel-rounded"
            >
              힝... <br /> 아래 웹툰도 <br />
              보고 가주세요...
              {/* 꼬리 */}
              <div
                className="absolute left-1/2 bottom-[-10px] -translate-x-1/2 w-0 h-0 
                        border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent 
                        border-t-[10px] border-t-[#121212]"
              />
              <div
                className="absolute left-1/2 bottom-[-7px] -translate-x-1/2 w-0 h-0 
                        border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent 
                        border-t-[8px] border-t-white"
              />
            </div>
          </div>

          {/* 캐릭터 */}
          <img
            src={SadCharacter}
            alt="말풍선 캐릭터"
            className="w-20 h-auto mt-10 [image-rendering:pixelated]"
          />
        </div>
      </div>

      {/* 중간 이미지 (웹툰/연출용) */}
      <div className="mt-5 flex justify-center bg-gradient-to-b from-[#fff8e7] via-[#121212] to-[#fff8e7] py-10">
        <MidImages34 itemWidth={300} whiteBg />
      </div>

      {/* 하단 버튼 */}
      <div className="mt-15 flex justify-center pb-15">
        <Button_L label="운세 카드 확인" width={260} onClick={handleNext} />
      </div>
    </main>
  );
}
