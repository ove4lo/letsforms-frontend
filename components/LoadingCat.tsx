import React from "react";

export function LoadingCat({ message = "Загрузка...", subMessage = "Пожалуйста, подождите" }: { message?: string; subMessage?: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8">
      {/* Милый котик-loading */}
      <div className="relative">
        {/* Кольцо спиннер */}
        <div className="w-32 h-32 rounded-full border-8 border-blue-200 dark:border-blue-900 animate-spin" />
        <div className="absolute inset-0 w-32 h-32 rounded-full border-t-8 border-blue-500 dark:border-blue-400 animate-spin" />

        {/* Мордочка котика в центре */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Ушки */}
            <div className="absolute -top-6 left-4 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-blue-500 dark:border-b-blue-400 rotate-12" />
            <div className="absolute -top-6 right-4 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-blue-500 dark:border-b-blue-400 -rotate-12" />

            {/* Лицо */}
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center">
              {/* Глазки */}
              <div className="flex gap-6">
                <div className="w-4 h-6 bg-foreground rounded-full animate-blink" />
                <div className="w-4 h-6 bg-foreground rounded-full animate-blink animation-delay-300" />
              </div>

              {/* Носик */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-500 dark:bg-pink-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-2xl font-semibold text-foreground">
          {message}
        </p>
        <p className="mt-2 text-muted-foreground">
          {subMessage}
        </p>
      </div>
    </div>
  );
}