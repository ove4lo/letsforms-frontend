import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const host = request.headers.get("host") || "";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const currentDomain = `${protocol}://${host}`;

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    if (!API_BASE) throw new Error("API_BASE not set");

    const url = new URL(request.url);
    const telegramData = {
      id: url.searchParams.get("id"),
      first_name: url.searchParams.get("first_name"),
      last_name: url.searchParams.get("last_name"),
      username: url.searchParams.get("username"),
      photo_url: url.searchParams.get("photo_url"),
      auth_date: url.searchParams.get("auth_date"),
      hash: url.searchParams.get("hash"),
    };

    if (!telegramData.id || !telegramData.hash) {
      return NextResponse.redirect(`${currentDomain}/auth?error=invalid_data`);
    }

    // Запрос к бэкенду
    const backendResponse = await fetch(`${API_BASE}/auth/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telegramData),
    });

    if (!backendResponse.ok) {
      return NextResponse.redirect(`${currentDomain}/auth?error=backend_fail`);
    }

    const backendData = await backendResponse.json();

    if (!backendData?.success || !backendData?.tokens?.access) {
      return NextResponse.redirect(`${currentDomain}/auth?error=no_tokens`);
    }

    const userData = {
      id: telegramData.id,
      first_name: telegramData.first_name,
      last_name: telegramData.last_name || null,
      username: telegramData.username || null,
      photo_url: telegramData.photo_url || null,
      user_id: backendData.user_id,
    };

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    
    const isSecure = protocol === "https";

    // 1. Кука пользователя
    cookieStore.set("tg_user", JSON.stringify(userData), {
      path: "/",
      secure: isSecure, 
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    // 2. Access Token
    cookieStore.set("access_token", backendData.tokens.access, {
      path: "/",
      secure: isSecure,
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60,
    });

    // 3. Refresh Token
    if (backendData.tokens.refresh) {
      cookieStore.set("refresh_token", backendData.tokens.refresh, {
        path: "/",
        secure: isSecure,
        sameSite: "lax",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return NextResponse.redirect(`${currentDomain}/auth/callback`);

  } catch (error) {
    const host = request.headers.get("host") || "l-manager.ru";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    return NextResponse.redirect(`${protocol}://${host}/auth?error=critical`);
  }
}