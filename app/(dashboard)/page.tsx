import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardPageClient from "./_components/DashboardPageClient";

// Временная серверная заглушка (потом переделаешь getMyForms под сервер)
async function getInitialFormsServer() {

  return { results: [], user_statistics: null };
}

export default async function Home() {
  const cookieStore = await cookies();
  const tgUserRaw = cookieStore.get("tg_user")?.value;

  if (!tgUserRaw) {
    redirect("/auth/");
  }

  let user;
  try {
    user = JSON.parse(tgUserRaw);
    if (!user?.id && !user?.user_id) {
      redirect("/auth/");
    }
  } catch {
    redirect("/auth/");
  }

  // Загружаем данные на сервере
  const initialData = await getInitialFormsServer();

  return (
    <DashboardPageClient
      initialForms={initialData.results || []}
      initialStats={initialData.user_statistics || null}
    />
  );
}