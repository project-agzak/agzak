
import Logo from '@/assets/Background/agzak-logo.svg';
import { Input } from '@/components/atoms/Input';
import { Button_M } from '@/components/atoms/Button_M';
import { Button_L } from '@/components/atoms/Button_L';


export default function SignupPage() {
  return (
    <main className="relative z-10 min-h-screen p-4">
      {/* ✅ 로고 (기존 크기 유지) */}
      <div className="ml-2 mt-5 flex w-full justify-center">
        <img src={Logo} alt="아그작 로고" className="mx-auto block" />
      </div>

      <div className="mt-8 flex w-full flex-col items-center gap-3">
        {/* ✅ 아이디 섹션: 버튼 + 인풋 한 그룹 */}
        <div className="flex w-full max-w-[300px] flex-col gap-1">
          {/* 버튼 정렬 커스텀 유지 */}
          <div className="right-align w-full pr-7">
            <Button_M to="#" label="중복확인" width={80} />
          </div>

          {/* 아이디 인풋 중앙 배치 */}
          <div className="flex justify-center">
            <Input placeholder="아이디" aria-label="아이디 입력" />
          </div>

          <p className="mt-0 pl-8 text-left font-galmuri-xsmall text-[#9CA3AF]">
            영어, 숫자 포함 6자에서 12자
          </p>
        </div>

        {/* ✅ 비밀번호 입력 */}
        <div className="flex w-full max-w-[300px] flex-col gap-1">
          <div className="flex justify-center">
            <Input
              placeholder="비밀번호"
              type="password"
              aria-label="비밀번호 입력"
            />
          </div>

          <p className="mt-0 pl-8 text-left font-galmuri-xsmall text-[#9CA3AF]">
            영어, 숫자 포함 6자에서 12자
          </p>
        </div>

        {/* ✅ 비밀번호 확인 */}
        <div className="flex w-full max-w-[300px] flex-col items-center gap-2">
          <Input
            placeholder="비밀번호 확인"
            type="password"
            aria-label="비밀번호 확인 입력"
          />
        </div>

        {/* ✅ 하단 버튼 */}
        <div className="mt-12 flex justify-center">
          <Button_L to="/login" label="계정 등록" width={260} />
        </div>
      </div>
    </main>
  );
}
