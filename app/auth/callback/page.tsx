"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingCat } from "@/components/ui/loading-cat";
import { getCookie } from "@/lib/cookies";

function AuthCallbackContent() {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    
    const tgUserRaw = getCookie("tg_user");
    
    if (tgUserRaw) {
      try {
        const user = JSON.parse(tgUserRaw);
        if (user.id || user.user_id) {
          const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
          sessionStorage.removeItem("redirectAfterLogin");

          setTimeout(() => {
            router.replace(redirectPath);
          }, 100);
          return;
        } else {
          console.error("❌ Invalid user structure in cookie");
        }
      } catch (e) {
        console.error("❌ Parse error:", e, "Raw data:", tgUserRaw);
      }
    } else {
      console.warn("⚠️ Cookie 'tg_user' not found yet. All cookies:", document.cookie);
    }

    if (attempt < 10) {
      const timer = setTimeout(() => setAttempt(prev => prev + 1), 500);
      return () => clearTimeout(timer);
    } else {
      console.error("🚫 Max attempts reached. Redirecting to login.");
      router.replace("/auth?error=timeout");
    }
  }, [attempt, router]);

  return <LoadingCat message="Входим..." />;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingCat message="Загрузка..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}