import BackBG from "@/assets/ui/Back.svg";
import Cow from "@/assets/Back/BackCow.svg"
import clsx from "clsx";

type Props = {
  className?: string;
  title?: string;
  message?: string;
};

export default function BackCard({
  className,
  title = "오늘의 운세 한마디",
  message = "주변에 덕을 베풀면 운이 상승하고, 노력과 도움으로 어려움도 극복할 수 있습니다.",
}: Props) {
  return (
    <div className={clsx("relative w-full h-full", className)}>
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
          <h2 className="font-bitbit tracking-wider leading-none">
            {title}
          </h2>
        </div>

        {/* 동물 아이콘 */}
        <div className="flex-1 w-full grid place-items-center">
          <img
            src={Cow}
            alt="동물 이모지"
            className="w-[38%] max-w-[140px] h-auto object-contain [image-rendering:pixelated]"
          />
        </div>

        {/* 메시지 카드 */}
        <div className="w-full px-6 pb-8">
          <div className="bg-[#EED0A4]/90 rounded-md shadow-sm px-5 py-4">
            <p className="font-galmuri-small text-[#121212] text-[14px] leading-[1.8]">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
