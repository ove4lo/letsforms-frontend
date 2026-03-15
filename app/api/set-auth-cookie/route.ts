import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullUser } = body;

    if (!fullUser || !fullUser.id) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    const cookieStore = await cookies();
    
    // Настройки безопасности
    const isProd = process.env.NODE_ENV === "production";
    
    // 1. Кука с данными пользователя (доступна JS для проверки на клиенте)
    // Сериализуем объект в строку
    const userStr = JSON.stringify(fullUser);
    
    cookieStore.set("tg_user", userStr, {
      httpOnly: false, // Важно: false, чтобы клиент мог прочитать через document.cookie
      secure: isProd,  // В продакшене только HTTPS
      sameSite: "lax", // Lax безопаснее для редиректов, чем strict
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: "/",
    });

    // 2. Access Token (только сервер)
    if (fullUser.access_token) {
      cookieStore.set("access_token", fullUser.access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 1 день
        path: "/",
      });
    }

    // 3. Refresh Token (только сервер)
    if (fullUser.refresh_token) {
      cookieStore.set("refresh_token", fullUser.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 дней
        path: "/",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка в /api/set-auth-cookie:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}