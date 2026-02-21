import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardPageClient from "./_components/DashboardPageClient";

export default async function Home() {
  const cookieStore = await cookies();
  const tgUser = cookieStore.get("tg_user")?.value;

  let user = null;
  if (tgUser) {
    try {
      user = JSON.parse(tgUser);
    } catch {}
  }

  if (!user?.id) {
    redirect("/auth/");
  }

  return <DashboardPageClient />;
}