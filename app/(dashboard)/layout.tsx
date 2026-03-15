"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingCat } from "@/components/ui/loading-cat";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Читаем куки
    const tgUserRaw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("tg_user="))
      ?.split("=")[1];

    if (!tgUserRaw) {
      router.replace("/auth/");
      return;
    }

    try {
      const decoded = decodeURIComponent(tgUserRaw);
      const parsed = JSON.parse(decoded);
      
      if (!parsed?.id && !parsed?.user_id) {
        throw new Error("Нет id в данных");
      }
      
      setUser(parsed);
    } catch (e) {
      console.error("[Layout] Auth error", e);
      router.replace("/auth/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <LoadingCat message="Проверка доступа..." subMessage="Секундочку" />;
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}