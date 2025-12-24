"use client";

import { useEffect } from "react";

export function TelegramLoginButton() {
  useEffect(() => {
    const container = document.getElementById("telegram-login");
    if (!container) return;

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "GoIPsender_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-auth-url", "/api/auth/telegram-login");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return <div id="telegram-login" className="flex justify-center min-h-[60px]" />;
}