import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function FormCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-5 w-full mt-3" />
        <Skeleton className="h-5 w-3/4 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-28" />
      </CardFooter>
    </Card>
  );
}