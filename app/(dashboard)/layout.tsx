"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LoadingCat } from "@/components/ui/loading-cat";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { getCookie } from "@/lib/cookies";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const tgUserRaw = getCookie("tg_user");
    
    if (!tgUserRaw) {
      sessionStorage.setItem("redirectAfterLogin", pathname);
      router.replace("/auth");
      return;
    }

    try {
      // Парсим пользователя
      const parsed = JSON.parse(tgUserRaw);
      if (parsed?.id || parsed?.user_id) {
        setUser(parsed);
      } else {
        throw new Error("Invalid user data");
      }
    } catch {
      // Если данные кривые - просто редирект
      router.replace("/auth");
    }
  }, [router, pathname]);

  // Пока нет пользователя - показываем котика
  if (!user) {
    return <LoadingCat message="Загрузка..." subMessage="Секундочку" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}