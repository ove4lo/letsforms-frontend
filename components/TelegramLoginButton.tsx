"use client";

import { useEffect, useRef } from "react";

const BOT_NAME_BASE = process.env.NEXT_PUBLIC_BOT_NAME!;

export function TelegramLoginButton() {
  const initializedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Защита от множественных инициализаций
    if (initializedRef.current) {
      return;
    }

    const container = document.getElementById("telegram-login") as HTMLDivElement | null;
    if (!container) {
      console.error("Контейнер #telegram-login не найден в DOM");
      return;
    }

    // Сохраняем ссылку на контейнер
    containerRef.current = container;

    // Очищаем контейнер перед добавлением нового скрипта
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", BOT_NAME_BASE);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-auth-url", "/telegram-login");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    script.onload = () => {
      initializedRef.current = true;
    };
    
    script.onerror = (e) => {
      console.error("Ошибка загрузки Telegram widget", e);
      initializedRef.current = false;
    };

    container.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      initializedRef.current = false;
    };
  }, []);

  return <div id="telegram-login" className="flex justify-center min-h-[80px]" />;
}