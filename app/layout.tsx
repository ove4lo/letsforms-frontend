import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider"; // Проверь путь к своему провайдеру темы
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { LoadingCat } from "@/components/ui/loading-cat";
import { RootAuthWrapper } from "@/components/layout/RootAuthWrapper"; // Создадим этот компонент ниже

const inter = Inter({ subsets: ["cyrillic", "latin"] });

export const metadata: Metadata = {
  title: "LetsForms",
  description: "Конструктор форм",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RootAuthWrapper>
            {children}
          </RootAuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}