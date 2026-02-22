"use client";

import { useEffect, useRef } from "react";

const BOT_NAME_BASE = process.env.NEXT_PUBLIC_BOT_NAME!;

export function TelegramLoginButton() {
  const initializedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Защита от множественных инициализаций
    if (initializedRef.current) {
      console.log("Telegram widget уже инициализирован, пропускаем...");
      return;
    }

    const container = document.getElementById("telegram-login") as HTMLDivElement | null;
    if (!container) {
      console.error("Контейнер #telegram-login не найден в DOM");
      return;
    }

    // Сохраняем ссылку на контейнер
    containerRef.current = container;

    console.log("Инициализация Telegram Login Widget");
    console.log("Имя бота:", BOT_NAME_BASE);
    console.log("data-auth-url:", "/telegram-login");

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
      console.log("Telegram widget скрипт загружен");
      initializedRef.current = true;
    };
    
    script.onerror = (e) => {
      console.error("Ошибка загрузки Telegram widget", e);
      initializedRef.current = false;
    };

    container.appendChild(script);

    return () => {
      console.log("Очистка Telegram widget");
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      initializedRef.current = false;
    };
  }, []); // Пустой массив зависимостей - выполняется только при монтировании

  return <div id="telegram-login" className="flex justify-center min-h-[80px]" />;
}