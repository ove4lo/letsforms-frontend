import { NextRequest, NextResponse } from "next/server";

// Публичные пути, куда пускаем без проверки
const PUBLIC_ROUTES = ["/auth", "/telegram-login", "/auth/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Пропускаем служебные роуты
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2. Проверяем куку tg_user
  const tgUserRaw = request.cookies.get("tg_user")?.value;
  let isAuthorized = false;

  if (tgUserRaw) {
    try {
      const user = JSON.parse(tgUserRaw);
      // Проверяем наличие ID
      if (user && (user.id || user.user_id)) {
        isAuthorized = true;
      }
    } catch (e) {
      console.warn("[MW] Ошибка парсинга куки пользователя", e);
    }
  }

  // 3. Если НЕ авторизован -> РЕДИРЕКТ НА /auth
  if (!isAuthorized) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    // Сохраняем полный путь (pathname + searchParams), чтобы вернуться точно туда
    const currentPath = `${pathname}${request.nextUrl.search}`;
    url.search = `?redirect=${encodeURIComponent(currentPath)}`;
    
    console.log(`[MW] ❌ Доступ запрещен. Редирект на: ${url.toString()}`);
    return NextResponse.redirect(url);
  }

  // 4. Если авторизован и пытается зайти на /auth -> Кидаем на главную или туда, куда хотел изначально
  if (pathname === "/auth") {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const target = redirectParam || "/";
    console.log(`[MW] ✅ Уже авторизован на странице входа. Редирект на: ${target}`);
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};