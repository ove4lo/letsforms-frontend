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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Всего посещений"
        icon={<LuView className="h-4 w-4 text-blue-600" />}
        helperText="За всё время"
        value={data.visits.toLocaleString("ru-RU")}
        loading={loading}
        className="shadow-md shadow-blue-600/10"
      />

      <StatsCard
        title="Всего ответов"
        icon={<LuMousePointerClick className="h-4 w-4 text-orange-600" />}
        helperText="За всё время"
        value={data.submissions.toLocaleString("ru-RU")}
        loading={loading}
        className="shadow-md shadow-orange-600/10"
      />

      <StatsCard
        title="Конверсия"
        icon={<LuTrendingUp className="h-4 w-4 text-emerald-600" />}
        helperText="Процент заполнивших форму"
        value={`${data.submissionRate.toFixed(1)}%`}
        loading={loading}
        className="shadow-md shadow-emerald-600/10"
      />

      <StatsCard
        title="Отказы"
        icon={<LuTrendingDown className="h-4 w-4 text-red-600" />}
        helperText="Процент ушедших без взаимодействия"
        value={`${data.bounceRate.toFixed(1)}%`}
        loading={loading}
        className="shadow-md shadow-red-600/10"
      />
    </div>
  );
}