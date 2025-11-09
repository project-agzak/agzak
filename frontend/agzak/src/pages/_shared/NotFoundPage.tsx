// src/pages/NotFoundPage.tsx
import { useNavigate } from "react-router-dom";
import { Button_L } from "@/components/atoms/Button_L"; 

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#FEFBF2] text-center p-4">
      <img
          src="/icons/icon-152.png"
        alt="404 Not Found"
        className="w-[180px] h-[180px] mb-6 animate-bounce"
      />
      <h1 className="font-bitbit-large text-[#121212] mb-2">404</h1>
      <p className="font-galmuri-small text-[#555] mb-6">
        페이지를 찾을 수 없습니다 🥲
      </p>
      <Button_L
        label="홈으로 돌아가기"
        width={200}
        onClick={() => navigate("/home")}
      />
    </main>
  );
}
