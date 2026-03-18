"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LuView, LuMousePointerClick, LuTrendingUp, LuTrendingDown } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import { getFormDetailedStats } from "@/lib/form";
import { FormDetailedStats } from "@/types/form";

interface MiniStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
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
  hash: string;
  // Опциональные начальные значения из списка форм
  initialVisits?: number;
  initialSubmissions?: number;
  initialSubmissionRate?: number;
  initialBounceRate?: number;
}

export function FormStatsCompact({ 
  hash,
  initialVisits = 0,
  initialSubmissions = 0,
  initialSubmissionRate = 0,
  initialBounceRate = 0
}: FormStatsCompactProps) {
  
  const [stats, setStats] = useState({
    visits: initialVisits,
    submissions: initialSubmissions,
    submissionRate: initialSubmissionRate,
    bounceRate: initialBounceRate
  });
  const [loading, setLoading] = useState(true);
  const [detailedData, setDetailedData] = useState<FormDetailedStats | null>(null);

  useEffect(() => {
    console.log("📊 ===== FormStatsCompact: ЗАГРУЗКА ДЕТАЛЬНОЙ СТАТИСТИКИ =====");
    console.log("📊 Hash формы:", hash);
    console.log("📊 Начальные значения:", {
      visits: initialVisits,
      submissions: initialSubmissions,
      submissionRate: initialSubmissionRate,
      bounceRate: initialBounceRate
    });
    
    const loadDetailedStats = async () => {
      try {
        setLoading(true);
        const data = await getFormDetailedStats(hash);
        
        if (data?.basic_stats) {
          console.log("📊 Получена детальная статистика с сервера:", data.basic_stats);
          
          setDetailedData(data);
          setStats({
            visits: data.basic_stats.visit_count,
            submissions: data.basic_stats.response_count,
            submissionRate: data.basic_stats.conversion_rate,
            bounceRate: data.basic_stats.bounce_rate
          });
          
          console.log("📊 Обновленные значения в компоненте:", {
            посещения: data.basic_stats.visit_count,
            ответы: data.basic_stats.response_count,
            конверсия: data.basic_stats.conversion_rate + '%',
            отказы: data.basic_stats.bounce_rate + '%',
            уникальные_посетители: data.basic_stats.unique_visitors,
            уникальные_респонденты: data.basic_stats.unique_respondents
          });
          
          // Сравниваем с начальными значениями (из списка форм)
          console.log("📊 Сравнение с данными из списка форм:", {
            посещения: {
              из_списка: initialVisits,
              детальные: data.basic_stats.visit_count,
              совпадает: initialVisits === data.basic_stats.visit_count ? "✅" : "❌"
            },
            ответы: {
              из_списка: initialSubmissions,
              детальные: data.basic_stats.response_count,
              совпадает: initialSubmissions === data.basic_stats.response_count ? "✅" : "❌"
            },
            конверсия: {
              из_списка: initialSubmissionRate,
              детальные: data.basic_stats.conversion_rate,
              совпадает: Math.abs(initialSubmissionRate - data.basic_stats.conversion_rate) < 0.1 ? "✅" : "❌"
            }
          });
        } else {
          console.log("📊 Не удалось получить детальную статистику, используем начальные значения");
        }
      } catch (error) {
        console.error("📊 Ошибка загрузки детальной статистики:", error);
      } finally {
        setLoading(false);
        console.log("📊 ===== FormStatsCompact: КОНЕЦ ЗАГРУЗКИ =====\n");
      }
    };

    if (hash) {
      loadDetailedStats();
    }
  }, [hash, initialVisits, initialSubmissions, initialSubmissionRate, initialBounceRate]);

  // Если хотите показать больше деталей (например, уникальных посетителей), можно добавить
  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      
      <MiniStatCard
        title="Посещения"
        value={loading ? "—" : stats.visits.toLocaleString("ru-RU")}
        icon={<LuView className="h-4 w-4" />}
        colorClass="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
        loading={loading}
      />
      
      <MiniStatCard
        title="Ответы"
        value={loading ? "—" : stats.submissions.toLocaleString("ru-RU")}
        icon={<LuMousePointerClick className="h-4 w-4" />}
        colorClass="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
        loading={loading}
      />
      
      <MiniStatCard
        title="Конверсия"
        value={loading ? "—" : `${stats.submissionRate.toFixed(1)}%`}
        icon={<LuTrendingUp className="h-4 w-4" />}
        colorClass="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
        loading={loading}
      />
      
      <MiniStatCard
        title="Отказы"
        value={loading ? "—" : `${stats.bounceRate.toFixed(1)}%`}
        icon={<LuTrendingDown className="h-4 w-4" />}
        colorClass="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
        loading={loading}
      />
    </div>
  );
}