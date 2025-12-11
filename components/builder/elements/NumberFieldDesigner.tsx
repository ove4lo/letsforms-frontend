import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DesignerElementProps } from "../types";

export function NumberFieldDesigner({ elementInstance }: DesignerElementProps) {
  const attrs = elementInstance.extraAttributes || {};

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">
        {attrs.label || "Числовое поле"}
        {attrs.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input type="number" readOnly placeholder={attrs.placeholder || "123"} />
    </div>
  );
}