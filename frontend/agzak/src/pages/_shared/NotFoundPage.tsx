// @/pages/_shared/NotFoundPage.tsx
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FortuneCookieGif from "@/assets/Gifs/FortuneCookie.gif" 

export default function NotFoundPage() {
  const navigate = useNavigate();

  const HOME_PATH = "/fortune";

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center p-3">
      <div className="w-full max-w-[480px] px-6 py-8">
        <div className="text-center">
          <p className="text-xs tracking-widest text-gray-400">ERROR</p>
          <div className="flex justify-center items-center">
            <img src={ FortuneCookieGif } alt="아그작" />
          </div>
          <h1 className="mt-1 text-5xl font-extrabold leading-tight">
            <span className="font-bitbit-xlarge bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500">
              404
            </span>
          </h1>
          <h2 className="mt-2 font-galmuri font-semibold text-gray-800 cursor-pointer">
            페이지를 찾을 수 없어요
          </h2>
          <p className="mt-2 font-galmuri-small text-gray-600 cursor-pointer">
            요청하신 주소가 변경되었거나, 일시적으로 사용할 수 없어요.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center font-galmuri-condensed-small">
            <Button onClick={() => navigate(-1)} variant="secondary" className="h-10">
              이전 페이지
            </Button>
            <Link to={HOME_PATH}>
              <Button className="h-10">홈으로 가기</Button>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
