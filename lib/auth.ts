import { cookies } from "next/headers";

export async function getCurrentUserServer() {
  const cookieStore = await cookies();
  const tgUser = cookieStore.get("tg_user")?.value || null;

  if (tgUser) {
    try {
      return JSON.parse(tgUser);
    } catch {}
  }

  return null;
}

// Для клиентских компонентов
export function getCurrentUserClient() {
  if (typeof window === "undefined") return null;

  const tgUser = localStorage.getItem("tg_user");
  if (tgUser) {
    try {
      return JSON.parse(tgUser);
    } catch {}
  }

  return null;
}