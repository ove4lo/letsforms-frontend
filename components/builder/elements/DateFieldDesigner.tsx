import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { DesignerElementProps } from "../types";

export function DateFieldDesigner({ elementInstance }: DesignerElementProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">
        Дата
      </Label>
      <div className="flex items-center gap-3 border rounded-md px-4 py-3 bg-background">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <span className="text-muted-foreground">Выберите дату</span>
      </div>
    </div>
  );
}