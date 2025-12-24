import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DesignerElementProps } from "../types";

export function NumberFieldDesigner({ elementInstance }: DesignerElementProps) {
  const attrs = elementInstance.extraAttributes || {};

  const minMaxText = [];
  if (attrs.min !== undefined) minMaxText.push(`от ${attrs.min}`);
  if (attrs.max !== undefined) minMaxText.push(`до ${attrs.max}`);
  const rangeText = minMaxText.length > 0 ? ` (${minMaxText.join(" ")})` : "";

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">
        {attrs.label || "Числовое поле"}
        {attrs.required && <span className="text-red-500 ml-1">*</span>}
        {rangeText && <span className="text-xs ml-2 text-muted-foreground">{rangeText}</span>}
      </Label>
      <Input
        type="number"
        readOnly
        placeholder={attrs.placeholder || "123"}
        className="bg-muted/30"
      />
    </div>
  );
}