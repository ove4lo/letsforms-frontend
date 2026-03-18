"use client";

import React, { useEffect, useState } from "react";

interface LoadingCatProps {
  message?: string;
  subMessage?: string;
}

export function LoadingCat({ 
  message = "Загрузка...", 
  subMessage = "Пожалуйста, подождите" 
}: LoadingCatProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center gap-8 p-4">
        <div className="w-32 h-32 rounded-full border-8 border-blue-200 dark:border-blue-900/50 border-t-8 border-t-blue-500 dark:border-t-blue-400 animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-2xl font-semibold text-foreground animate-pulse">
            {message}
          </p>
          <p className="text-muted-foreground">
            {subMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center gap-8 p-4">
      {/* Контейнер котика */}
      <div className="relative">
        {/* Кольцо спиннер (фон) */}
        <div className="w-32 h-32 rounded-full border-8 border-blue-200 dark:border-blue-900/50" />
        
        {/* Кольцо спиннер (активное) */}
        <div className="absolute inset-0 w-32 h-32 rounded-full border-t-8 border-blue-500 dark:border-blue-400 animate-spin" />

        {/* Мордочка котика в центре */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Ушки */}
            {/* Левое ухо */}
            <div className="absolute -top-5 left-2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-blue-500 dark:border-b-blue-400 rotate-12" />
            {/* Правое ухо */}
            <div className="absolute -top-5 right-2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-blue-500 dark:border-b-blue-400 -rotate-12" />

            {/* Лицо */}
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center shadow-sm relative z-10">
              {/* Глазки */}
              <div className="flex gap-5">
                <div 
                  className="w-3 h-5 bg-foreground rounded-full animate-[blink_4s_infinite]" 
                  style={{ animationDelay: '0s' }} 
                />
                <div 
                  className="w-3 h-5 bg-foreground rounded-full animate-[blink_4s_infinite]" 
                  style={{ animationDelay: '0.3s' }} 
                />
              </div>

              {/* Носик */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-500 dark:bg-pink-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-2xl font-semibold text-foreground animate-pulse">
          {message}
        </p>
        <p className="text-muted-foreground">
          {subMessage}
        </p>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }
      `}</style>
    </div>
  );
}