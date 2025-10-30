// src/components/AppLoader.tsx
import cookieGif from '@/assets/Gifs/FortuneCookie.gif';

export default function AppLoader({
  label = '불러오는 중...',
  fullscreen = false,
}: { label?: string; fullscreen?: boolean }) {
  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[9999] grid place-items-center'
          : 'grid place-items-center py-10'
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <img
        src={cookieGif}
        alt="포춘 쿠키 로딩"
        width={160}
        height={160}
        className="block h-24 w-24 md:h-28 md:w-28"
        style={{ imageRendering: 'pixelated' }}
      />
      <p className="font-galmuri">{label}</p>
    </div>
  );
}
