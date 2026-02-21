import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/auth", "/telegram-login", "/auth/callback"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Пропускаем публичные пути
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Логируем для отладки
  console.log(`[Middleware] Путь: ${pathname}`);

  const tgUserCookie = request.cookies.get("tg_user");

  console.log(
    `[Middleware] tg_user raw: ${
      tgUserCookie?.value
        ? tgUserCookie.value.substring(0, 100) + "..."
        : "КУКИ НЕТ"
    }`
  );

  if (!tgUserCookie?.value) {
    console.log("[Middleware] Нет tg_user → редирект на /auth");
    return redirectToAuth(request);
  }

  try {
    const user = JSON.parse(tgUserCookie.value);
    if (!user?.id && !user?.user_id) {
      console.log("[Middleware] tg_user есть, но нет id/user_id → редирект");
      return redirectToAuth(request);
    }
    console.log(`[Middleware] Пользователь найден: ${user.id || user.user_id}`);
  } catch (err) {
    console.error("[Middleware] Ошибка парсинга tg_user:", err);
    return redirectToAuth(request);
  }

  return NextResponse.next();
}

function redirectToAuth(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/auth";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Защищаем все пути кроме:
     * - api (API роуты)
     * - _next/static (статические файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico
     * - публичные пути авторизации
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth|telegram-login|auth/callback).*)",
  ],
};