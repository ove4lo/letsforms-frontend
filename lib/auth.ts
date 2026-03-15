import { getCookie } from "./cookies";

export async function getCurrentUserServer() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const tgUserRaw = cookieStore.get("tg_user")?.value;

  if (tgUserRaw) {
    try {
      return JSON.parse(tgUserRaw);
    } catch (e) {
      console.error("Failed to parse tg_user on server", e);
      return null;
    }
  }
  return null;
}

export function getCurrentUserClient() {
  if (typeof window === "undefined") return null;

  const tgUserRaw = getCookie("tg_user");
  
  if (tgUserRaw) {
    try {
      return JSON.parse(tgUserRaw);
    } catch (e) {
      console.error("Failed to parse tg_user on client", e);
      return null;
    }
  }

  return null;
}