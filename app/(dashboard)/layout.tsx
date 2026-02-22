"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  LayoutDashboard, 
  ChevronLeft,
  FileText
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tgUserRaw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("tg_user="))
      ?.split("=")[1];

    if (!tgUserRaw) {
      console.log("[Layout] tg_user в куках не найдена → на /auth/");
      router.replace("/auth/");
      return;
    }

    let decoded: string;
    try {
      decoded = decodeURIComponent(tgUserRaw);
    } catch (e) {
      console.error("[Layout] decodeURIComponent failed", e);
      router.replace("/auth/");
      return;
    }

    try {
      const parsed = JSON.parse(decoded);
      if (!parsed?.id && !parsed?.user_id) {
        throw new Error("Нет id в данных");
      }
      setUser(parsed);
    } catch (e) {
      console.error("[Layout] Не удалось распарсить tg_user", e, decoded);
      router.replace("/auth/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Функция для проверки, находимся ли мы на странице формы
  const isFormPage = pathname?.startsWith('/forms/') && pathname !== '/forms';
  const isBuilderPage = pathname?.startsWith('/builder/');
  const isResponsesPage = pathname?.includes('/responses');
  
  // Получаем hash формы из URL если мы на странице формы
  const formHash = isFormPage || isBuilderPage || isResponsesPage 
    ? pathname?.split('/')[2] 
    : null;

  const handleBack = () => {
    router.back();
  };

  const handleDashboard = () => {
    router.push('/');
  };

  if (loading) {
    return <div>Проверка авторизации...</div>;
  }

  if (!user) {
    return null; 
  }

  const displayName = user.first_name || user.username || "Пользователь";
  const initials =
    (user.first_name?.[0] || "") + (user.last_name?.[0] || "") ||
    user.username?.[0]?.toUpperCase() ||
    "?";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="flex justify-between items-center border-b h-16 px-6">
        <div className="flex items-center gap-4">
          <Logo />

          {/* Навигационные кнопки */}
          <div className="flex items-center gap-2 ml-4">
            {/* Кнопка "Назад" (появляется не на главной) */}
            {pathname !== '/' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </Button>
            )}

            {/* Кнопка "Дашборд" (если не на главной) */}
            {pathname !== '/' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDashboard}
                className="flex items-center gap-1"
              >
                <LayoutDashboard className="h-4 w-4" />
                Дашборд
              </Button>
            )}

            {/* Хлебные крошки / контекстные кнопки */}
            {isFormPage && formHash && (
              <>
                <span className="text-muted-foreground mx-1">/</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/forms/${formHash}`} className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Страница формы
                  </Link>
                </Button>
              </>
            )}

            {isBuilderPage && formHash && (
              <>
                <span className="text-muted-foreground mx-1">/</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/forms/${formHash}`} className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    К странице формы
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photo_url} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    @{user.username || "—"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onSelect={() => {
                  document.cookie =
                    "tg_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                  document.cookie =
                    "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                  router.replace("/auth/");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}