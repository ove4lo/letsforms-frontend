import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DesignerElementProps } from "../types";

export function TextareaFieldDesigner({ elementInstance }: DesignerElementProps) {
  const attrs = elementInstance.extraAttributes || {};

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">
        {attrs.label || "Текстовая область"}
        {attrs.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea readOnly placeholder={attrs.placeholder || "Введите длинный текст..."} />
    </div>
  );
}