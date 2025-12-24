import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function FormCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-5 w-full mt-3" />
        <Skeleton className="h-5 w-3/4 mt-2" />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="text-center">
            <Skeleton className="h-4 w-32 mx-auto mb-2" />
            <Skeleton className="h-8 w-20 mx-auto" />
          </div>
          <div className="text-center">
            <Skeleton className="h-4 w-32 mx-auto mb-2" />
            <Skeleton className="h-8 w-20 mx-auto" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-shrink-0 flex justify-between mt-auto">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-28" />
      </CardFooter>
    </Card>
  );
}