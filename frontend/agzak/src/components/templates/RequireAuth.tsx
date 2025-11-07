// src/components/templates/RequireAuth.tsx
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";


type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { isLoggedIn , logout } = useAuthStore();
  const location = useLocation();




   if (isLoggedIn ) {
    logout();
    return <Navigate to="/" replace />;
  }

  if (!isLoggedIn ) {
    // 로그인 안 되어 있으면 로그인 페이지로 보내고,
    // 나중에 돌아올 수 있도록 현재 위치를 state로 같이 보냄
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}
