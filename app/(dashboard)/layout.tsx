"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LoadingCat } from "@/components/ui/loading-cat";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { getCookie } from "@/lib/cookies";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Читаем куку через функцию
    const tgUserRaw = getCookie("tg_user");

    if (!tgUserRaw) {
      sessionStorage.setItem("redirectAfterLogin", pathname);
      router.replace("/auth");
      return;
    }

    try {
      const parsed = JSON.parse(tgUserRaw);

      if (!parsed?.id && !parsed?.user_id) {
        throw new Error("Invalid user structure");
      }
      
      setUser(parsed);
    } catch (e) {
      console.error("[Layout] Auth error: Invalid cookie data", e);
      document.cookie = "tg_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.replace("/auth");
    } finally {
      setLoading(false);
    }
  }, [router, pathname]);

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