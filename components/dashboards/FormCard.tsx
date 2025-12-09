import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Edit, Share2 } from "lucide-react";

type Props = {
  id: number | string;
  title: string;
  description?: string | null;
  visits: number;
  submissions: number;
  createdAt: Date | string;
};

export function FormCard({
  id,
  title,
  description,
  visits,
  submissions,
  createdAt,
}: Props) {
  const date =
    createdAt instanceof Date ? createdAt : new Date(createdAt);

  return (
    <div className="rounded-xl border bg-card/95 dark:bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-200 h-full flex flex-col
                border-blue-200 dark:border-transparent
                ring-1 ring-blue-300/20 dark:ring-transparent
                hover:ring-blue-500/50 dark:hover:ring-blue-400/50">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2 min-h-16">
          <h3 className="text-lg font-semibold line-clamp-2 leading-tight flex-1 pr-2">
            {title}
          </h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {date.toLocaleDateString("ru-RU")}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
          {description || "Без описания"}
        </p>

        <Separator className="my-5" />

        <div className="grid grid-cols-2 gap-6 text-center mb-6">
          <div>
            <p className="text-muted-foreground text-xs">Посещений</p>
            <p className="text-2xl font-bold">
              {visits.toLocaleString("ru-RU")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Ответов</p>
            <p className="text-2xl font-bold">
              {submissions.toLocaleString("ru-RU")}
            </p>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Button asChild className="flex-1">
            <Link href={`/builder/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </Link>
          </Button>
          <Button variant="outline" size="icon" title="Поделиться">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}