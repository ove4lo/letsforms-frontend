import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Определяем базовый URL текущего приложения
    const host = request.headers.get("host") || "l-manager.ru";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const currentDomain = `${protocol}://${host}`;

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    if (!API_BASE) {
      console.error("NEXT_PUBLIC_API_BASE не задан в .env");
      return NextResponse.redirect(`${currentDomain}/auth/`);
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Собираем все данные, которые пришли от Telegram Login Widget
    const telegramData = {
      id: searchParams.get("id"),
      first_name: searchParams.get("first_name"),
      last_name: searchParams.get("last_name"),
      username: searchParams.get("username"),
      photo_url: searchParams.get("photo_url"),
      auth_date: searchParams.get("auth_date"),
      hash: searchParams.get("hash"),
    };

    console.log("Получены данные от Telegram:", telegramData);

    // Проверяем обязательные поля
    if (!telegramData.id || !telegramData.hash) {
      console.warn("Отсутствует id или hash → пользователь не авторизован");
      return NextResponse.redirect(`${currentDomain}/auth/`);
    }

    console.log("Отправляем данные на бэкенд →", `${API_BASE}/auth/`);

    // Запрос на сервер для проверки подписи и получения токенов
    const backendResponse = await fetch(`${API_BASE}/auth/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telegramData),
    });

    const responseText = await backendResponse.text();
    console.log(`Ответ бэкенда: ${backendResponse.status}`);
    console.log("Тело ответа:", responseText);

    if (!backendResponse.ok) {
      console.error("Бэкенд вернул ошибку:", backendResponse.status, responseText);
      return NextResponse.redirect(`${currentDomain}/auth/`);
    }

    let backendData;
    try {
      backendData = JSON.parse(responseText);
    } catch (err) {
      console.error("Не удалось распарсить JSON от бэкенда:", responseText, err);
      return NextResponse.redirect(`${currentDomain}/auth/`);
    }

    if (!backendData?.success || !backendData?.tokens?.access) {
      console.error("Бэкенд не вернул success или access token:", backendData);
      return NextResponse.redirect(`${currentDomain}/auth/`);
    }

    // Формируем объект пользователя для куки tg_user
    const userData = {
      id: telegramData.id,
      first_name: telegramData.first_name,
      last_name: telegramData.last_name || null,
      username: telegramData.username || null,
      photo_url: telegramData.photo_url || null,
      user_id: backendData.user_id, 
    };

    const cookieStore = await cookies();

    // Основная кука с данными пользователя 
    cookieStore.set("tg_user", JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: "/",
    });

    if (backendData.tokens?.access) {
      cookieStore.set("access_token", backendData.tokens.access, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 15,
        path: "/",
      });
    }

    if (backendData.tokens?.refresh) {
      cookieStore.set("refresh_token", backendData.tokens.refresh, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    // Успешный редирект на страницу обратного вызова
    const callbackUrl = `${currentDomain}/auth/callback`;
    console.log("Успешная авторизация → редирект на:", callbackUrl);

    return NextResponse.redirect(callbackUrl);
  } catch (error: any) {
    console.error("Критическая ошибка в /telegram-login:", error);
    const host = request.headers.get("host") || "l-manager.ru";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    return NextResponse.redirect(`${protocol}://${host}/auth/`);
  }
}