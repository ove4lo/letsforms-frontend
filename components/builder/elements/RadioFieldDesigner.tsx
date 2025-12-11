import { Label } from "@/components/ui/label";
import { Circle } from "lucide-react";
import { DesignerElementProps } from "../types";

export function RadioFieldDesigner({ elementInstance }: DesignerElementProps) {
  const attrs = elementInstance.extraAttributes || {};
  const options = attrs.options || ["Вариант 1", "Вариант 2"];

  return (
    <div className="flex flex-col gap-3 w-full">
      <Label className="text-muted-foreground">
        {attrs.label || "Радиокнопки"}
        {attrs.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="space-y-2">
        {options.map((opt: string, idx: number) => (
          <div key={idx} className="flex items-center gap-3">
            <Circle className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-foreground">{opt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}