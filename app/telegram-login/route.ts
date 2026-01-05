import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const host = request.headers.get("host") || "";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const currentDomain = `${protocol}://${host}`;

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const telegramData = {
      id: searchParams.get("id"),
      first_name: searchParams.get("first_name"),
      last_name: searchParams.get("last_name"),
      username: searchParams.get("username"),
      photo_url: searchParams.get("photo_url"),
      auth_date: searchParams.get("auth_date"),
      hash: searchParams.get("hash"),
    };

    if (!telegramData.id || !telegramData.hash) {
      return NextResponse.redirect(`${currentDomain}/auth`);
    }

    // POST на бэкенд
    const backendResponse = await fetch("https://l-manager.ru/api/auth/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telegramData),
    });

    console.log("Backend response:", backendResponse.status);

    if (!backendResponse.ok) {
      console.error("Backend error:", await backendResponse.text());
      return NextResponse.redirect(`${currentDomain}/auth?error=backend`);
    }

    const backendData = await backendResponse.json();
    console.log("Backend data:", backendData);

    if (!backendData.success || !backendData.tokens?.access) {
      return NextResponse.redirect(`${currentDomain}/auth?error=no_tokens`);
    }

    // Объединяем данные Telegram + токен от бэкенда
    const fullUser = {
      ...telegramData,
      access_token: backendData.tokens.access,
      refresh_token: backendData.tokens.refresh || null,
      user_id: backendData.user_id,
      username: backendData.username,
    };

    // ФИКС: Кодируем в base64 правильно (для Unicode)
    const jsonString = JSON.stringify(fullUser);
    // Вариант 1: Используем Buffer в Node.js
    const payload = Buffer.from(jsonString).toString('base64');
    
    // Или вариант 2: Используем encodeURIComponent для строки
    // const payload = encodeURIComponent(jsonString);

    const callbackUrl = `${currentDomain}/auth/callback?payload=${payload}`;
    console.log("Redirecting to:", callbackUrl);

    return NextResponse.redirect(callbackUrl);
    
  } catch (error: any) {
    console.error("Ошибка:", error);
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    return NextResponse.redirect(`${protocol}://${host}/auth?error=exception`);
  }
}