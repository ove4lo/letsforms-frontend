// letsforms-frontend/app/(dashboard)/forms/[hash]/_components/FormStatsCompact.tsx
"use client";

import { Card } from "@/components/ui/card";
import { LuView, LuMousePointerClick, LuTrendingUp, LuTrendingDown } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";

interface MiniStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string; // Классы для цвета границы и фона
  loading?: boolean;
}

function MiniStatCard({ title, value, icon, colorClass, loading }: MiniStatCardProps) {
  return (
    <Card className={`flex flex-col justify-center p-4 h-[90px] ${colorClass} border-opacity-60`}>
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-medium text-muted-foreground uppercase tracking-wide truncate max-w-[65%]">
          {title}
        </span>
        <div className="text-muted-foreground/70">{icon}</div>
      </div>
      
      <div className="mt-auto">
        {loading ? (
          <Skeleton className="h-3 w-16 rounded-md" />
        ) : (
          <span className="text-xl font-bold text-foreground leading-none tabular-nums">
            {value}
          </span>
        )}
      </div>
    </Card>
  );
}

interface FormStatsCompactProps {
  visits: number;
  submissions: number;
  submissionRate: number;
  bounceRate?: number;
  loading?: boolean;
}

export function FormStatsCompact({ 
  visits, 
  submissions, 
  submissionRate, 
  bounceRate = 0,
  loading = false 
}: FormStatsCompactProps) {
  
  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      
      <MiniStatCard
        title="Посещения"
        value={loading ? "—" : visits.toLocaleString("ru-RU")}
        icon={<LuView className="h-4 w-4" />}
        colorClass="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
        loading={loading}
      />
      
      <MiniStatCard
        title="Ответы"
        value={loading ? "—" : submissions.toLocaleString("ru-RU")}
        icon={<LuMousePointerClick className="h-4 w-4" />}
        colorClass="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
        loading={loading}
      />
      
      <MiniStatCard
        title="Конверсия"
        value={loading ? "—" : `${submissionRate.toFixed(1)}%`}
        icon={<LuTrendingUp className="h-4 w-4" />}
        colorClass="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
        loading={loading}
      />
      
      <MiniStatCard
        title="Отказы"
        value={loading ? "—" : `${bounceRate.toFixed(1)}%`}
        icon={<LuTrendingDown className="h-4 w-4" />}
        colorClass="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
        loading={loading}
      />
    </div>
  );
}