"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from '@/components/Logo';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const tgUserStr = localStorage.getItem("tg_user");
      if (tgUserStr) {
        try {
          const parsedUser = JSON.parse(tgUserStr);
          setUser(parsedUser);
          setLoading(false);
        } catch (e) {
          console.error("Ошибка парсинга tg_user", e);
          localStorage.removeItem("tg_user");
          router.replace("/auth");
          setLoading(false);
        }
      } else {
        router.replace("/auth");
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (!user) {
    return null; 
  }

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || "?";

  return (
    <div className="flex flex-col min-h-screen min-w-full bg-background max-h-screen">
      <nav className="flex justify-between items-center border-b border-border h-[60px] px-4 py-2">
        <Logo />
        <div className="flex gap-4 items-center">
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photo_url || user.telegram_photo_url} alt={user.username} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.first_name || user.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    @{user.username || user.telegram_username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onSelect={() => {
                  localStorage.clear();
                  window.location.href = "/auth";
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <main className="flex w-full flex-grow">
        {children}
      </main>
    </div>
  );
}