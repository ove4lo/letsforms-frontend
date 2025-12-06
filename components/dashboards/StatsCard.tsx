import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";

interface Props {
  title: string;
  value: string | number;
  helperText: string;
  icon: ReactNode;
  loading: boolean;
  className?: string;
}

export function StatsCard({ title, value, helperText, icon, loading, className }: Props) {
  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-5 w-5">{icon}</div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="text-3xl font-bold tabular-nums">
          {loading ? <Skeleton className="h-9 w-32" /> : value}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {helperText}
        </p>
      </CardContent>
    </Card>
  );
}