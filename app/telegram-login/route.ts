import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const host = request.headers.get("host") || "l-manager.ru";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const currentDomain = `${protocol}://${host}`;

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
    if (!API_BASE) {
      console.error("NEXT_PUBLIC_API_BASE не задан");
      return NextResponse.redirect(`${currentDomain}/auth?error=config`);
    }

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

    console.log("Telegram data:", telegramData);

    if (!telegramData.id || !telegramData.hash) {
      return NextResponse.redirect(`${currentDomain}/auth`);
    }

    // POST на бэкенд 
    const backendResponse = await fetch(`${API_BASE}/auth/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telegramData),
    });

    const responseText = await backendResponse.text();
    console.log("Backend status:", backendResponse.status);
    console.log("Backend body:", responseText);

    if (!backendResponse.ok) {
      return NextResponse.redirect(`${currentDomain}/auth?error=backend`);
    }

    let backendData;
    try {
      backendData = JSON.parse(responseText);
    } catch (e) {
      console.error("JSON parse error:", responseText);
      return NextResponse.redirect(`${currentDomain}/auth?error=parse`);
    }

    if (!backendData.success || !backendData.tokens?.access) {
      return NextResponse.redirect(`${currentDomain}/auth?error=no_tokens`);
    }

    const fullUser = {
      id: telegramData.id,
      first_name: telegramData.first_name,
      last_name: telegramData.last_name,
      username: telegramData.username,
      photo_url: telegramData.photo_url,
      access_token: backendData.tokens.access,
      refresh_token: backendData.tokens.refresh || null,
      user_id: backendData.user_id,
    };

    const payload = Buffer.from(JSON.stringify(fullUser)).toString("base64");

    const callbackUrl = `${currentDomain}/auth/callback?payload=${payload}`;
    console.log("Redirecting to:", callbackUrl);

    return NextResponse.redirect(callbackUrl);
  } catch (error: any) {
    console.error("Ошибка в /telegram-login:", error);
    const host = request.headers.get("host") || "l-manager.ru";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    return NextResponse.redirect(`${protocol}://${host}/auth?error=exception`);
  }
}