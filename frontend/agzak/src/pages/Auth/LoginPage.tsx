// src/pages/Auth/LoginPage.tsx
import { useNavigate } from 'react-router-dom';

import Logo from '@/assets/Background/agzak-logo.svg';
import { Input } from '@/components/atoms/Input';
import { Button_L } from '@/components/atoms/Button_L';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleKakaoLogin = () => {
    // 실제 연동 시 OAuth 시작 URL로 교체
    window.location.href = '/auth/kakao';
  };
const handleFortuneClick = () => {
  window.location.href = "/fortune"; // 또는 router.push("/fortune");
};
  return (
    <main className="relative z-10 min-h-screen p-4">
      {/* ✅ 로고 */}
      <div className="ml-2 mt-5 flex w-full justify-center">
        <img src={Logo} alt="아그작 로고" className="mx-auto block" />
      </div>

      {/* ✅ 폼 컨테이너 */}
      <div className="mt-8 flex w-full flex-col items-center gap-4">
        {/* 이메일 */}
        <div className="flex w-full max-w-[300px] flex-col items-center gap-2">
          <Input placeholder="이메일" aria-label="이메일" />
        </div>

        {/* 비밀번호 */}
        <div className="flex w-full max-w-[300px] flex-col items-center gap-2">
          <Input placeholder="비밀번호" type="password" aria-label="비밀번호" />
        </div>

        {/* ✅ 로그인 버튼 + 카카오 로그인 + 회원가입 */}
        <div className="mt-3 flex flex-col items-center gap-3">
          {/* 기본 로그인 */}
          <Button_L to="/" label="로그인" width={260} />

          {/* 카카오 로그인: 키보드 접근성 + 비율 유지 */}
          <button
            type="button"
            onClick={handleKakaoLogin}
            aria-label="카카오로 로그인"
            className="focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
          >
            <img
              src="/images/kakao_login_medium_wide.svg"
              alt="카카오 로그인"
              className="block h-auto w-[270px] cursor-pointer transition"
              draggable={false}
            />
          </button>

          {/* 회원가입 링크 */}
         <div className="mt-3 flex items-center justify-center gap-3">
  {/* 회원가입 버튼 */}
  <button
    type="button"
    onClick={handleSignupClick}
    className="cursor-pointer font-galmuri-small font-extrabold text-[#121212] transition-colors hover:text-[#000]"
  >
    회원가입
  </button>

  {/* 구분선 */}
  <span className="text-[#888] font-galmuri-small select-none">|</span>

  {/* 운세 보기 버튼 */}
  <button
    type="button"
    onClick={handleFortuneClick} // ✨ 새 함수 만들어서 페이지 이동 or 액션
    className="cursor-pointer font-galmuri-small font-extrabold text-[#121212] transition-colors hover:text-[#000]"
  >
    로그인 없이 운세 보기
  </button>
</div>
        </div>
      </div>
    </main>
  );
}
