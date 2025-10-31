import { Input } from '@/components/atoms/Input';
import { Button_L } from '@/components/atoms/Button_L';

export default function MyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-[#FFF9EF] pt-16">
      <div className="flex flex-col items-center gap-3">
        {/* ① 이름(닉네임) */}
        <div className="flex w-full max-w-[300px] flex-col gap-1">
          <div className="flex w-full justify-center">
            {/* 👇 label만 한 번 더 감싸 폭 줄이기 */}
            <div className="w-[230px] text-left">
              <label className="font-galmuri-small font-extrabold text-[#222]">
                이름 (닉네임)
              </label>
            </div>
          </div>
          <Input placeholder="Nickname" aria-label="이름(닉네임) 입력" />
        </div>

        {/* ② 생년월일 */}
        <div className="flex w-full max-w-[300px] flex-col gap-1">
          <div className="mx-auto flex w-[230px] justify-between">
            <label className="font-galmuri-small font-extrabold text-[#222]">
              생년월일
            </label>
            <span className="font-galmuri-small font-extrabold text-[#222]">양력</span>
          </div>
          <Input placeholder="YYYY.MM.DD" inputMode="numeric" aria-label="생년월일 입력" />
        </div>

        {/* ③ 태어난 시간 */}
        <div className="flex w-full max-w-[300px] flex-col gap-1">
          <div className="flex w-full justify-center">
            <div className="w-[230px] text-left">
              <label className="font-galmuri-small font-extrabold text-[#222]">
                태어난 시간
              </label>
            </div>
          </div>
          <Input placeholder="HH.MM" inputMode="numeric" aria-label="태어난 시간 입력" />
        </div>

        {/* ④ 태어난 도시 */}
        <div className="flex w-full max-w-[300px] flex-col gap-1">
          <div className="flex w-full justify-center">
            <div className="w-[230px] text-left">
              <label className="font-galmuri-small font-extrabold text-[#222]">
                태어난 도시
              </label>
            </div>
          </div>
          <Input placeholder="City" aria-label="태어난 도시 입력" />
        </div>

        {/* 하단 버튼 */}
        <div className="mt-12 flex justify-center">
          <Button_L to="/my/edit" label="정보 등록" width={260} />
        </div>
      </div>
    </main>
  );
}
