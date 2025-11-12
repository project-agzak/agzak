import { trackError, trackEvent } from "@/lib/analytics";
import { api } from "@/lib/api";
import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import Logo from "@/assets/Background/agzak-logo.svg";
import { Button_L } from "@/components/atoms/Button_L";
import { Button_M } from "@/components/atoms/Button_M";
import { Input } from "@/components/atoms/Input";
import openIcon from "/images/open.svg";
import closeIcon from "/images/close.svg";

type CheckEmailResponse = {
   email: string;
  available: boolean;

};

type RegisterWithGuestResponse = {
  accessToken?: string;
  refreshToken?: string;
};

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [emailChecked, setEmailChecked] = useState(false);
  const [checking, setChecking] = useState(false);

    //  비밀번호 표시/숨김
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordCheckVisible, setPasswordCheckVisible] = useState(false);

  const guestId = localStorage.getItem("guestId");

  // 이메일 형식 검사
  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = regex.test(value);
    setEmailValid(valid);
    if (!valid) setEmailChecked(false);
  };

  // 비밀번호 형식 검사 (8자 이상, 영문+숫자)
  const validatePassword = (value: string) => {
  
   //  영문 + 숫자 + 특수문자 허용 (8자 이상 100자 이하)
const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=\[{\]};:'",<.>/?`~\\|]{8,100}$/;

    setPasswordValid(regex.test(value));
  };


  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    validateEmail(val);
    setEmailChecked(false);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    validatePassword(val);
    setPasswordMatch(passwordCheck === val);
  };

  const handlePasswordCheckChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPasswordCheck(val);
    setPasswordMatch(password === val);
  };

  // 이메일 중복확인
  const handleCheckEmail = async () => {
    if (!emailValid || !email) {
      alert("올바른 이메일을 입력해주세요.");
      return;
    }

    setChecking(true);

    const res = await api.get<CheckEmailResponse>("/auth/check-email", {
      params: { email },
    });

    setChecking(false);

    if (!res.ok || !res.data) {
      //console.error("이메일 중복확인 실패:", res.error);
      alert(res.error?.message ?? "서버와 통신 중 오류가 발생했습니다.");
      return;
    }
  //  여기부터 변경
  const { available } = res.data;
  //console.log("이메일 중복확인 결과:", res.data);

  if (!available) {
    // 이미 사용 중
    alert("이미 사용 중인 이메일입니다.");
    setEmailChecked(false);
  } else {
    // 사용 가능
    alert("사용 가능한 이메일입니다.");
    setEmailChecked(true);
  }
  };
const emailHelperText = (() => {
  if (!email) {
    // 아직 아무것도 안 적었을 때
    return "이메일 형식으로 작성해주세요.";
  }
  if (!emailValid) {
    // 형식 틀렸을 때
    return "이메일 형식이 올바르지 않습니다.";
  }
  if (emailChecked) {
    // 중복 확인 통과 후
    return "중복 확인이 완료되었습니다.";
  }
  // 형식은 맞고, 아직 중복 확인 전이면 → 아무 문구도 표시 안 함
  return "중복 확인 버튼을 눌러주세요.";
})();
const emailHasError = !emailValid || (email && !emailChecked);

  // 회원가입
  const handleRegister = async () => {
    const guestId = localStorage.getItem("guestId");

    if (!email || !password || !passwordCheck) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (!emailValid) {
      alert("이메일 형식을 확인해주세요.");
      return;
    }

    if (!passwordValid) {
      alert("비밀번호 형식을 확인해주세요.");
      return;
    }

    if (!passwordMatch) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (!emailChecked) {
      alert("이메일 중복 확인을 먼저 해주세요.");
      return;
    }

    // 게스트가 아닌 경우 → 이메일/비번만 저장 후 Fortune 페이지로 이동
    if (!guestId) {
      const userInfo = {
        email,
        password,
        passwordCheck,
      };
      localStorage.setItem("userId", JSON.stringify(userInfo));
      navigate("/fortune");
      return;
    }

    // 게스트인 경우 → with-guest 회원가입
    const res = await api.post<RegisterWithGuestResponse>(
      "/auth/register/with-guest",
      {
        email,
        password,
        guestId,
      }
    );

    if (!res.ok || !res.data) {
      //console.error("회원가입 요청 실패:", res.error);
      alert(res.error?.message ?? "서버와 통신 중 오류가 발생했습니다.");
      return;
    }

    const data = res.data;
    //console.log("게스트 정보로 회원가입 성공:", data);

    if (data.accessToken) {
      localStorage.setItem("access_token", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refresh_token", data.refreshToken);
      }
    }

    localStorage.removeItem("guestId");

    // Analytics: 회원가입 완료
    try {
      trackEvent("auth_signup_complete", { method: guestId ? "with_guest" : "email" });
    } catch (e) {
      trackError("auth_signup_event_fail", (e as any)?.message ?? "event error");
    }

    alert("회원가입이 완료되었습니다!");
    navigate("/login");
  };
const handleKakaoLogin = () => {
    window.history.pushState({}, "", "/login");
    // Analytics: 로그인 시도
    trackEvent("auth_login_kakao_attempt");

    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert("카카오 SDK가 초기화되지 않았습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }

    const redirectUri = `${window.location.origin}${window.location.pathname}`;

    window.Kakao.Auth.authorize({
      redirectUri,
      scope: "profile_nickname,account_email",
    });
  };
  
  return (
    <main className="relative z-10 min-h-screen p-4">
      <div className="ml-2 mt-5 flex w-full justify-center">
        <img src={Logo} alt="아그작 로고" className="mx-auto block" />
      </div>

        <div className="mt-8 flex w-full flex-col items-center gap-3">
    {/* 카카오 로그인 */}
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

    {/* 🔹 구분선 (divider) */}
    <div className="relative my-6 w-[270px]">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-[#D1D5DB]" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-[10px] text-gray-400 font-galmuri-xsmall">
          또는 이메일로 가입
        </span>
      </div>
    </div>
        <div className="flex w-full max-w-[300px] flex-col gap-1">
          <div className="right-align w-full pr-7">
            <Button_M
              label={checking ? "확인중..." : "중복확인"}
              width={80}
              onClick={handleCheckEmail}
            />
          </div>
          <div className="flex justify-center">
            <Input
              placeholder="이메일"
              aria-label="이메일 입력"
              value={email}
              onChange={handleEmailChange}
              disabled={checking}
            />
          </div>

          <p
           className={`mt-0 pl-8 text-left font-galmuri-xsmall ${
    emailHasError ? "text-[#E11D48]" : "text-[#9CA3AF]"
  }`}
>
  {emailHelperText}
</p>

        </div>

         {/* 비밀번호 */}
        <div className="flex w-full max-w-[300px] flex-col gap-1 relative">
          <div className="flex justify-center relative">
            <Input
              placeholder="비밀번호"
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
            />
            <img
              src={passwordVisible ? openIcon : closeIcon}
              alt="비밀번호 보기 토글"
              className="absolute right-10 top-4 w-5 h-5 cursor-pointer"
              onClick={() => setPasswordVisible(!passwordVisible)}
            />
          </div>
          <p
            className={`mt-0 pl-8 text-left font-galmuri-xsmall ${
              passwordValid ? "text-[#9CA3AF]" : "text-[#E11D48]"
            }`}
          >
            {passwordValid
              ? "영어, 숫자 포함 8자이상"
              : "비밀번호 형식이 올바르지 않습니다."}
          </p>
        </div>

         {/* 비밀번호 확인 */}
        <div className="flex w-full max-w-[300px] flex-col gap-1 relative">
          <div className="flex justify-center relative">
            <Input
              placeholder="비밀번호 확인"
              type={passwordCheckVisible ? "text" : "password"}
              value={passwordCheck}
              onChange={handlePasswordCheckChange}
            />
            <img
              src={passwordCheckVisible ? openIcon : closeIcon}
              alt="비밀번호 확인 보기 토글"
              className="absolute right-10 top-4 w-5 h-5 cursor-pointer"
              onClick={() => setPasswordCheckVisible(!passwordCheckVisible)}
            />
          </div>
          {!passwordMatch && (
            <p className="pl-8 text-left font-galmuri-xsmall text-[#E11D48]">
              비밀번호가 일치하지 않습니다.
            </p>
          )}
        </div>

        <div className="mt-12 flex justify-center pb-15">
          <Button_L
            label={guestId ? "계정 등록" : "다음 단계로"}
            width={260}
            onClick={handleRegister}
          />
        </div>
      </div>
    </main>
  );
}
