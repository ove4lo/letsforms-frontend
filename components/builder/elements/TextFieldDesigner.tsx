import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DesignerElementProps } from "../types";

export function TextFieldDesigner({ elementInstance }: DesignerElementProps) {
  const attrs = elementInstance.extraAttributes || {};

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">
        {attrs.label || "Текстовое поле"}
        {attrs.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input readOnly placeholder={attrs.placeholder || "Введите текст..."} />
    </div>
  );
}