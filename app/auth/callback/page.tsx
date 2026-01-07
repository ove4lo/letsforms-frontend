"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingCat } from "@/components/LoadingCat";

// Основной компонент с логикой
function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const payload = searchParams.get("payload");

    if (payload) {
      try {
        const decoded = JSON.parse(atob(payload));
        localStorage.setItem("access_token", decoded.access_token || "");
        if (decoded.refresh_token) {
          localStorage.setItem("refresh_token", decoded.refresh_token);
        }
        localStorage.setItem("tg_user", JSON.stringify(decoded));
      } catch (e) {
        console.error("Ошибка парсинга", e);
      }
    }

    // Возвращаемся на форму, если пришли с неё
    const redirect = sessionStorage.getItem("redirectAfterLogin") || "/";
    sessionStorage.removeItem("redirectAfterLogin");
    router.replace(redirect);
  }, [searchParams, router]);

  return <LoadingCat message="Вход выполнен..." subMessage="Перенаправляем..." />;
}

// Главный компонент с Suspense
export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingCat message="Загрузка..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}