// src/components/templates/RequireAuth.tsx
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { isLoggedIn } = useAuthStore();
  const location = useLocation();

    const alertedRef = useRef(false);
  useEffect(() => {
    if (!isLoggedIn && !alertedRef.current) {
      alertedRef.current = true;
      alert("로그인 후 이용해주세요.");
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
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
