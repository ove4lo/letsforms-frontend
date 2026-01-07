"use client";

import { useEffect } from "react";

const BOT_NAME = process.env.NEXT_PUBLIC_BOT_NAME!;

export function TelegramLoginButton() {
  useEffect(() => {
    // Очищаем контейнер
    const container = document.getElementById("telegram-login");
    if (!container) return;
    container.innerHTML = "";

    // Создаём скрипт виджета
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", BOT_NAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");

    // Добавляем функцию onTelegramAuth
    const authScript = document.createElement("script");
    authScript.text = `
      function onTelegramAuth(user) {
        // user содержит id, hash и все нужные поля
        fetch('/telegram-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(data => {
          if (data.redirect) {
            window.location.href = data.redirect;
          }
        })
        .catch(err => console.error('Auth error:', err));
      }
    `;

    container.appendChild(script);
    container.appendChild(authScript);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return <div id="telegram-login" className="flex justify-center min-h-[80px]" />;
}