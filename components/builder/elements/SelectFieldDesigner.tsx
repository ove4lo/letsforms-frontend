import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { DesignerElementProps } from "../types";

export function SelectFieldDesigner({ elementInstance }: DesignerElementProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Выпадающий список</Label>
      <div className="flex items-center justify-between border rounded-md px-4 py-2 bg-background">
        <span className="text-muted-foreground">Выберите вариант</span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}