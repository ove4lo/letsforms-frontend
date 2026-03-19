"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "./dashboard-header";
import { LoadingCat } from "@/components/ui/loading-cat";
import { getCookie } from "@/lib/cookies";

const NO_HEADER_ROUTES = ["/auth", "/telegram-login"];

export function RootAuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const tgUserRaw = getCookie("tg_user");
    let validUser = null;

    if (tgUserRaw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(tgUserRaw));
        if (parsed && (parsed.id || parsed.user_id)) {
          validUser = parsed;
        }
      } catch (e) {}
    }

    setUser(validUser);
    setChecked(true);
  }, []);

  // Публичные роуты — рендерим сразу, без проверки
  if (NO_HEADER_ROUTES.some((r) => pathname?.startsWith(r))) {
    return <>{children}</>;
  }

  if (!checked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <LoadingCat message="Загрузка..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <LoadingCat message="Перенаправление..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="flex-1 overflow-auto w-full">{children}</main>
    </div>
  );
}