"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LoadingCat } from "@/components/ui/loading-cat";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { getCookie, clearAuthCookies } from "@/lib/cookies";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tgUserRaw = getCookie("tg_user");

    if (!tgUserRaw) {
      sessionStorage.setItem("redirectAfterLogin", pathname);
      router.replace("/auth");
      return;
    }

    try {
      const parsed = JSON.parse(tgUserRaw);
      if (!parsed?.id && !parsed?.user_id) throw new Error("Invalid data");
      setUser(parsed);
    } catch (e) {
      console.error("Auth error:", e);
      clearAuthCookies();
      router.replace("/auth");
    } finally {
      setLoading(false);
    }
  }, [router, pathname]);

  if (loading) return <LoadingCat message="Проверка..." subMessage="Секундочку" />;
  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}