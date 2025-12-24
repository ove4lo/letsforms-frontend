"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingCat } from "@/components/LoadingCat";

export default function AuthCallback() {
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
        console.error("Ошибка парсинга payload", e);
      }
    }

    router.replace("/");
  }, [searchParams, router]);

  return (
    <LoadingCat 
      message="Вход выполнен..." 
      subMessage="Перенаправляем на дашборд" 
    />
  );
}