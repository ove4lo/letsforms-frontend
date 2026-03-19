"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { LoadingCat } from "@/components/ui/loading-cat";
import { getCookie } from "@/lib/cookies";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const tgUserRaw = getCookie("tg_user");
    
    let validUser = null;
    let authorized = false;

    if (tgUserRaw) {
      try {
        const decoded = decodeURIComponent(tgUserRaw);
        const parsed = JSON.parse(decoded);
        
        // Строгая проверка на наличие ID
        if (parsed && (parsed.id || parsed.user_id || parsed.telegram_id)) {
          validUser = parsed;
          authorized = true;
        }
      } catch (e) {
        console.warn("Layout: Invalid user cookie", e);
      }
    }

    setUser(validUser);
    setIsAuthorized(authorized);
    setLoading(false);
    
  }, []);

  if (loading) {
    return <LoadingCat message="Проверка доступа..." subMessage="Секундочку" />;
  }

  if (!isAuthorized || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <LoadingCat message="Перенаправление..." subMessage="Нет доступа" />
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}