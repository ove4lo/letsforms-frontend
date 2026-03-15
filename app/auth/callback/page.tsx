"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingCat } from "@/components/ui/loading-cat";
import { getCookie } from "@/lib/cookies";

function AuthCallbackContent() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const tgUserRaw = getCookie("tg_user");
      
      if (tgUserRaw) {
        try {
          const user = JSON.parse(tgUserRaw);
          if (user.id || user.user_id) {
            const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
            sessionStorage.removeItem("redirectAfterLogin");
            router.replace(redirectPath);
            return;
          }
        } catch (e) {
          console.error("Parse error in callback", e);
        }
      }

      setTimeout(checkAuth, 500);
    };

    checkAuth();
  }, [router]);

  return <LoadingCat message="Завершаем авторизацию..." subMessage="Telegram подтверждает вход" />;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingCat message="Загрузка..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}