import { Card } from "@/components/ui/card";

interface FormStatsProps {
  visitCount?: number;
  responseCount?: number;
  conversionRate?: number;
}

export default function FormStats({ visitCount = 0, responseCount = 0, conversionRate = 0 }: FormStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-5 text-center bg-card/50 dark:bg-card/30 ring-1 ring-primary/20 hover:ring-primary/50 transition-all">
        <p className="text-3xl font-bold text-primary">
          {visitCount.toLocaleString("ru-RU")}
        </p>
        <p className="text-sm text-muted-foreground mt-2">Посещений</p>
      </Card>
      <Card className="p-5 text-center bg-card/50 dark:bg-card/30 ring-1 ring-primary/20 hover:ring-primary/50 transition-all">
        <p className="text-3xl font-bold text-primary">
          {responseCount.toLocaleString("ru-RU")}
        </p>
        <p className="text-sm text-muted-foreground mt-2">Ответов</p>
      </Card>
      <Card className="p-5 text-center bg-card/50 dark:bg-card/30 ring-1 ring-primary/20 hover:ring-primary/50 transition-all">
        <p className="text-3xl font-bold text-primary">
          {conversionRate}%
        </p>
        <p className="text-sm text-muted-foreground mt-2">Конверсия</p>
      </Card>
    </div>
  );
}