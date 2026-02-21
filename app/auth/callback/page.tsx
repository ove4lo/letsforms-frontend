"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingCat } from "@/components/LoadingCat";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Проверяем наличие куки
    const tgUserRaw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("tg_user="))
      ?.split("=")[1];

    console.log("Callback: сырое значение tg_user →", tgUserRaw || "нет куки");

    if (!tgUserRaw) {
      console.warn("Callback: tg_user не найдена → всё равно редиректим на главную");
    }

    const redirectPath =
      sessionStorage.getItem("redirectAfterLogin") || "/";
    sessionStorage.removeItem("redirectAfterLogin");

    console.log("Callback: редирект на →", redirectPath);

    router.replace(redirectPath);
  }, [router]);

  return <LoadingCat message="Завершаем авторизацию..." />;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingCat message="Загрузка..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}