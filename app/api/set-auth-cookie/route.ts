import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullUser } = body;

    if (!fullUser || !fullUser.id) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    // Устанавливаем куки на сервере
    const cookieStore = cookies();
    (await cookieStore).set("tg_user_set", "true", {
      httpOnly: false, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, 
      path: "/",
    });

    //  токены отдельно
    if (fullUser.access_token) {
      (await cookieStore).set("access_token", fullUser.access_token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, 
        path: "/",
      });
    }
    if (fullUser.refresh_token) {
      (await cookieStore).set("refresh_token", fullUser.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, 
        path: "/",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка в /api/set-auth-cookie:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}