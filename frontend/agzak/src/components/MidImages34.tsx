

/** src/assets/Fortune 폴더의 이미지들을 URL로 수집 (빌드 시 처리) */
const webps = import.meta.glob("/src/assets/Fortune/*.webp", {
  eager: true,
  as: "url",
}) as Record<string, string>;

const avifs = import.meta.glob("/src/assets/Fortune/*.avif", {
  eager: true,
  as: "url",
}) as Record<string, string>;

/** "C:/.../12.webp" → 12 숫자 추출 */
function numFromPath(p: string) {
  const m = p.match(/([0-9]+)\.(webp|avif)$/i);
  return m ? parseInt(m[1], 10) : Number.POSITIVE_INFINITY;
}

/** AVIF 있으면 우선, 없으면 WebP 폴백 */
const images = (() => {
  // 두 포맷의 번호를 합집합으로 모음
  const nums = new Set<number>([
    ...Object.keys(webps).map(numFromPath),
    ...Object.keys(avifs).map(numFromPath),
  ]);
  // 숫자 정렬 후 각 번호에 대해 (avif?, webp?) 매핑
  return Array.from(nums)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
    .map((n) => {
      const avif = Object.entries(avifs).find((x) => numFromPath(x[0]) === n)?.[1];
      const webp = Object.entries(webps).find((x) => numFromPath(x[0]) === n)?.[1];
      return { n, avif, webp };
    });
})();

type Props = {
  itemWidth?: number; // 가로 폭 (px)
  className?: string;
  whiteBg?: boolean;  // 투명 배경일 때 흰 배경으로 깔기
};

export function MidImages34({ itemWidth = 300, className = "", whiteBg = true }: Props) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {images.map(({ n, avif, webp }) => (
        <picture key={n} className={`flex justify-center ${whiteBg ? "bg-white" : ""}`}>
          {avif && <source srcSet={avif} type="image/avif" />}
          {webp && <source srcSet={webp} type="image/webp" />}
          <img
            src={avif || webp!}                 // 최종 폴백
            alt={`fortune ${n}`}
            width={itemWidth}
            height="auto"
            loading="lazy"
            decoding="async"
            // fetchPriority는 타입 최신 아니면 경고 날 수 있음. 필요 없으면 지워도 OK
            // fetchPriority={idx < 2 ? "high" : "auto"}
            className={`block w-[${itemWidth}px] h-auto`}
          />
        </picture>
      ))}
    </div>
  );
}
