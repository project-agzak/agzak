import type { FortuneCookieDetail } from "@/types/cookies";
import BubbleCollection from "@/assets/ui/bubble-collection.webp";

export type CookieCollectionItemProps = {
  id: string;
  imgSrc: string;
  detail: FortuneCookieDetail;
  selected: boolean;
  onSelect?: (id: string) => void;
};

const rarityColorMap: Record<string, string> = {
  RARE: "#3B82F6",       // 파랑
  EPIC: "#8B5CF6",       // 보라
  UNIQUE: "#FACC15",     // 노랑
  LEGENDARY: "#4ADE80",  // 연두
};

export function CookieCollectionItem({
  id,
  imgSrc,
  detail,
  selected,
  onSelect,
}: CookieCollectionItemProps) {
  const handleClick = () => {
    onSelect?.(id);
  };

  // 등급 텍스트 계산 ("등급: " 제거)
  const rawRarity = detail.effects?.[1]?.label?.replace("등급: ", "") ?? "";
  const rarityColor = rarityColorMap[rawRarity] ?? "#121212";

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* 쿠키 버튼 */}
      <button
        type="button"
        onClick={handleClick}
        className="relative flex items-center justify-center focus:outline-none"
      >
        <img
          src={imgSrc}
          alt={detail.title}
          className="h-[90px] w-[90px] object-contain"
          draggable={false}
        />
      </button>

      {/* 말풍선 */}
      {selected && (
        <div
          className="
            pointer-events-none
            absolute
            top-2
            left-1/2
            -translate-x-1/2
            -translate-y-full
            z-10
            w-[180px]
          "
        >
          {/* 말풍선 배경 */}
          <img
            src={BubbleCollection}
            alt=""
            aria-hidden="true"
            className="w-full h-auto object-contain select-none"
            draggable={false}
          />

          {/* 내용 */}
        <div
        className="
            absolute
            left-0 right-0
            top-[2px]     
            bottom-[20px]
            px-4
            flex flex-col items-center justify-center text-center
        "
        >
        {/* 레시피 제목 (조금 작은 굵은 글씨) */}
        <p className="font-galmuri font-bold !text-[14px] text-[#121212] mb-1 leading-tight">
            {detail.title}
        </p>

        {/* 레시피 문장 */}
        {detail.effects?.length > 0 && (
            <p className="whitespace-pre-line font-galmuri !text-[12px] leading-tight text-[#121212]">
            {detail.effects[0].label}
            </p>
        )}

        {/* 등급: 색 강조 + 굵게 (등급: 제거) */}
        {rawRarity && (
            <p
            className="mt-1 font-galmuri font-bold !text-[12px]"
            style={{ color: rarityColor }}
            >
            {rawRarity}
            </p>
        )}
        </div>

        </div>
      )}
    </div>
  );
}

export default CookieCollectionItem;
