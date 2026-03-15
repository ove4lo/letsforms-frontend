"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { LoadingCat } from "./loading-cat";

interface PageErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  type?: "error" | "not-found" | "unauthorized";
}

export function PageError({ 
  title = "Упс! Что-то пошло не так", 
  message, 
  onRetry,
  type = "error"
}: PageErrorProps) {
  
  const getIcon = () => {
    switch (type) {
      case "not-found": return "🔍";
      case "unauthorized": return "🔒";
      default: return <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="flex justify-center">
          {typeof getIcon() === "string" ? (
            <span className="text-6xl">{getIcon()}</span>
          ) : (
            getIcon()
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {message && (
            <p className="text-muted-foreground text-lg leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {onRetry && (
          <Button onClick={onRetry} className="mt-4 gap-2">
            <RefreshCw className="h-4 w-4" />
            Попробовать снова
          </Button>
        )}
        
        {!onRetry && (
          <p className="text-sm text-muted-foreground mt-4">
            Попробуйте обновить страницу или вернуться на главную.
          </p>
        )}
      </div>
    </div>
  );
}