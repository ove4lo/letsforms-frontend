"use client";

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
  FileText,
  Home,
  ArrowLeft
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { clearAuthCookies } from "@/lib/cookies";

interface DashboardHeaderProps {
  user: any;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = user.first_name || user.username || "Пользователь";
  const initials =
    (user.first_name?.[0] || "") + (user.last_name?.[0] || "") ||
    user.username?.[0]?.toUpperCase() ||
    "?";

  // Логика определения типа страницы для навигации
  const isFormPage = pathname?.startsWith('/forms/') && pathname !== '/forms';
  const isBuilderPage = pathname?.startsWith('/builder/');
  const isResponsesPage = pathname?.includes('/responses');
  
  const formHash = (isFormPage || isBuilderPage || isResponsesPage) 
    ? pathname?.split('/')[2] 
    : null;

  const handleBack = () => router.back();
  const handleDashboard = () => router.push('/');
  
  const handleLogout = () => {
    // 1. Очищаем все auth-куки через централизованную функцию
    clearAuthCookies();
    
    // 2. Принудительно редиректим на страницу входа
    router.replace("/auth");
  };

  // Мобильное меню с навигацией
  const MobileNavigation = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      {/* Триггер кнопки меню вынесен выше в JSX, здесь только контент */}
      <SheetContent side="left" className="w-[250px] sm:w-[300px]">
        <div className="flex flex-col gap-4 mt-8">
        {pathname !== '/' && (
          <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack} 
                className="flex items-center gap-1 h-8 px-2"
                title="Назад"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Назад</span>
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDashboard} 
                className="flex items-center gap-1 h-8 px-2"
                title="Дашборд"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Дашборд</span>
              </Button>
            </div>
          )}

          {(isFormPage || isBuilderPage) && formHash && (
            <>
              <span className="text-muted-foreground mx-1 hidden sm:inline">/</span>
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="h-8 px-2"
              >
                <Link href={`/forms/${formHash}`} className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isBuilderPage ? 'Редактор' : isResponsesPage ? 'Ответы' : 'Форма'}
                  </span>
                </Link>
              </Button>
            </>
          )}

          {(isFormPage || isBuilderPage) && formHash && (
            <Button variant="ghost" className="flex items-center justify-start gap-3 w-full" asChild>
              <Link 
                href={`/forms/${formHash}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                {isBuilderPage ? 'К странице формы' : 'Страница формы'}
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <nav className="flex justify-between items-center border-b h-14 sm:h-16 px-3 sm:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {/* Кнопка мобильного меню */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
               <div className="flex flex-col gap-4 mt-8">
                {pathname !== '/' && (
                  <>
                    <Button variant="ghost" className="flex items-center justify-start gap-3 w-full" onClick={() => { handleBack(); setMobileMenuOpen(false); }}>
                      <ArrowLeft className="h-4 w-4" /> Назад
                    </Button>
                    <Button variant="ghost" className="flex items-center justify-start gap-3 w-full" onClick={() => { handleDashboard(); setMobileMenuOpen(false); }}>
                      <Home className="h-4 w-4" /> На главную
                    </Button>
                  </>
                )}
                {(isFormPage || isBuilderPage) && formHash && (
                  <Button variant="ghost" className="flex items-center justify-start gap-3 w-full" asChild>
                    <Link href={`/forms/${formHash}`} onClick={() => setMobileMenuOpen(false)}>
                      <FileText className="h-4 w-4" /> {isBuilderPage ? 'К форме' : 'Форма'}
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Логотип */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Десктопная навигация */}
        <div className="hidden md:flex items-center gap-2 ml-4 min-w-0">
          {pathname !== '/' && (
            <>
              <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-1 flex-shrink-0" title="Назад">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden lg:inline">Назад</span>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleDashboard} className="flex items-center gap-1 flex-shrink-0" title="Дашборд">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden lg:inline">Дашборд</span>
              </Button>
            </>
          )}

          {(isFormPage || isBuilderPage) && formHash && (
            <>
              <span className="text-muted-foreground mx-1 hidden lg:inline">/</span>
              <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
                <Link href={`/forms/${formHash}`} className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="hidden lg:inline">{isBuilderPage ? 'Редактор' : 'Форма'}</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <ThemeSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring p-0">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src={user.photo_url} alt={displayName} />
                <AvatarFallback className="bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 text-xs sm:text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 sm:w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate max-w-[150px] sm:max-w-[180px]">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground leading-none pt-1 truncate max-w-[150px] sm:max-w-[180px]">
                  @{user.username || "—"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer focus:text-red-600"
              onSelect={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Выйти</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}