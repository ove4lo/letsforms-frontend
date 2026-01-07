"use client";

import { useEffect } from "react";

const BOT_NAME_BASE = process.env.NEXT_PUBLIC_BOT_NAME!;

export function TelegramLoginButton() {
  useEffect(() => {
    const container = document.getElementById("telegram-login");
    if (!container) {
      console.error("Контейнер #telegram-login не найден в DOM");
      return;
    }

    console.log("Инициализация Telegram Login Widget");
    console.log("Имя бота:", BOT_NAME_BASE);
    console.log("data-auth-url:", "/telegram-login");

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", BOT_NAME_BASE);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-auth-url", "/telegram-login");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    script.onload = () => console.log("Telegram widget скрипт загружен");
    script.onerror = (e) => console.error("Ошибка загрузки Telegram widget", e);

    container.appendChild(script);

    return () => {
      console.log("Очистка Telegram widget");
      container.innerHTML = "";
    };
  }, []);

  return <div id="telegram-login" className="flex justify-center min-h-[80px]" />;
}