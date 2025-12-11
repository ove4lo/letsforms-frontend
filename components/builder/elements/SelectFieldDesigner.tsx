import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { DesignerElementProps } from "../types";

export function SelectFieldDesigner({ elementInstance }: DesignerElementProps) {
  const attrs = elementInstance.extraAttributes || {};
  const options = attrs.options || ["Вариант 1", "Вариант 2", "Вариант 3"];

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">
        {attrs.label || "Выпадающий список"}
        {attrs.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex items-center justify-between border rounded-lg px-4 py-3 bg-background">
        <span className="text-muted-foreground">
          {options.length > 0 ? options[0] : "Выберите вариант"}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}