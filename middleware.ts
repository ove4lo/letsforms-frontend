// letsforms-frontend/middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Публичные пути, куда пускаем БЕЗ проверки авторизации
const PUBLIC_ROUTES = ["/auth", "/telegram-login", "/auth/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Пропускаем служебные роуты и статику
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Получаем куку
  const tgUserRaw = request.cookies.get("tg_user")?.value;
  let isAuthorized = false;

  if (tgUserRaw) {
    try {
      const user = JSON.parse(decodeURIComponent(tgUserRaw)); // Часто куки приходят закодированными
      // Проверяем наличие ID (поддерживаем разные варианты ключей)
      if (user && (user.id || user.user_id || user.telegram_id)) {
        isAuthorized = true;
      }
    } catch (e) {
      console.warn("[MW] Invalid tg_user cookie format", e);
      // Если кука битая, считаем пользователя неавторизованным
      isAuthorized = false;
    }
  }

  // 2. Если НЕ авторизован -> ЖЕСТКИЙ РЕДИРЕКТ НА /auth
  if (!isAuthorized) {
    const loginUrl = new URL("/auth", request.url);
    // Сохраняем полный путь, куда хотел пользователь
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    
    // Возвращаем редирект. Next.js прервет выполнение здесь.
    return NextResponse.redirect(loginUrl);
  }

  // 3. Если авторизован и пытается зайти на страницу логина -> Кидаем на главную или redirect
  if (pathname === "/auth") {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const target = redirectParam || "/";
    // Избегаем циклического редиректа, если target тоже auth
    if (target === "/auth") {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Применяем ко всем путям, кроме статики и api (api часто требует своей логики)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};