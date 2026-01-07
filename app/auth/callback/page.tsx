"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingCat } from "@/components/LoadingCat";

export const dynamic = 'force-dynamic';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    console.log("AuthCallback: текущий URL:", window.location.href);
    console.log("searchParams:", Object.fromEntries(searchParams));

    const payload = searchParams.get("payload");

    if (!payload) {
      console.error("Payload не найден в URL");
      router.replace("/auth?error=no_payload");
      return;
    }

    console.log("Payload получен:", payload);

    try {
      const decoded = JSON.parse(atob(payload));
      console.log("Декодированные данные:", decoded);

      localStorage.setItem("access_token", decoded.access_token || "");
      if (decoded.refresh_token) {
        localStorage.setItem("refresh_token", decoded.refresh_token);
      }
      localStorage.setItem("tg_user", JSON.stringify(decoded));

      console.log("Токены и пользователь сохранены в localStorage");
    } catch (e) {
      console.error("Ошибка парсинга payload:", e);
      router.replace("/auth?error=invalid_payload");
      return;
    }

    const redirect = sessionStorage.getItem("redirectAfterLogin") || "/";
    console.log("Редирект на:", redirect);
    sessionStorage.removeItem("redirectAfterLogin");
    router.replace(redirect);
  }, [searchParams, router]);

  return <LoadingCat message="Вход выполнен..." subMessage="Перенаправляем..." />;
}