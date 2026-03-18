import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardsLoading() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="flex flex-col justify-center p-3 sm:p-4 h-[80px] sm:h-[90px]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
            <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
          </div>
          <div className="mt-auto">
            <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 mt-1" />
          </div>
        </Card>
      ))}
    </div>
  );
}