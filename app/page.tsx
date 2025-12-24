"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "./(dashboard)/layout";
import AuthPage from "./auth/page";

export default function HomePage({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const tgUserStr = typeof window !== "undefined" ? localStorage.getItem("tg_user") : null;

  let user = null;
  if (tgUserStr && tgUserStr !== "undefined" && tgUserStr !== "null") {
    try {
      user = JSON.parse(tgUserStr);
    } catch (e) {
      console.error("Ошибка парсинга tg_user", e);
      localStorage.removeItem("tg_user");
    }
  }

  useEffect(() => {
    if (!user) {
      router.replace("/auth");
    }
  }, [user, router]);

  if (!user) {
    return <AuthPage />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}