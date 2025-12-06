import { StatsCard } from "./StatsCard";
import { LuView, LuMousePointerClick, LuTrendingUp, LuTrendingDown } from "react-icons/lu";

interface Props {
  data: {
    visits: number;
    submissions: number;
    submissionRate: number;
    bounceRate: number;
  };
  loading: boolean;
}

export function StatsCards({ data, loading }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Всего посещений"
        icon={<LuView className="h-7 w-7" />}
        helperText="За всё время"
        value={data.visits.toLocaleString("ru-RU")}
        loading={loading}
        className="border-2 border-blue-500/40 bg-blue-500/5 shadow-xl shadow-blue-500/20"
      />
      <StatsCard
        title="Всего ответов"
        icon={<LuMousePointerClick className="h-7 w-7" />}
        helperText="За всё время"
        value={data.submissions.toLocaleString("ru-RU")}
        loading={loading}
        className="border-2 border-orange-500/40 bg-orange-500/5 shadow-xl shadow-orange-500/20"
      />
      <StatsCard
        title="Конверсия"
        icon={<LuTrendingUp className="h-7 w-7" />}
        helperText="Процент заполнивших форму"
        value={`${data.submissionRate.toFixed(1)}%`}
        loading={loading}
        className="border-2 border-emerald-500/40 bg-emerald-500/5 shadow-xl shadow-emerald-500/20"
      />
      <StatsCard
        title="Отказы"
        icon={<LuTrendingDown className="h-7 w-7" />}
        helperText="Процент ушедших без взаимодействия"
        value={`${data.bounceRate.toFixed(1)}%`}
        loading={loading}
        className="border-2 border-red-500/40 bg-red-500/5 shadow-xl shadow-red-500/20"
      />
    </div>
  );
}