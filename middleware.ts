import { NextRequest, NextResponse } from "next/server";

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
      const user = JSON.parse(decodeURIComponent(tgUserRaw));
      if (user && (user.id || user.user_id || user.telegram_id)) {
        isAuthorized = true;
      }
    } catch (e) {
      console.warn("[MW] Invalid tg_user cookie format", e);
      isAuthorized = false;
    }
  }

  if (!isAuthorized) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/auth") {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const target = redirectParam || "/";
    if (target === "/auth") {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};