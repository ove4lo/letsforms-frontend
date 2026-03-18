"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { LoadingCat } from "@/components/ui/loading-cat";
import { getCookie } from "@/lib/cookies";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tgUserRaw = getCookie("tg_user");
    
    if (tgUserRaw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(tgUserRaw));
        setUser(parsed);
      } catch (e) {
        console.error("Client layout: Failed to parse user", e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingCat message="Загрузка..." subMessage="Проверяем доступ" />;
  }

  if (!user) {
     return (
       <div className="flex items-center justify-center h-screen">
         <p className="text-red-500">Ошибка сессии. Пожалуйста, войдите снова.</p>
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