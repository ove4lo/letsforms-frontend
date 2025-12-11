import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DesignerElementProps } from "../types";

export function TextareaFieldDesigner({ elementInstance }: DesignerElementProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Текстовая область</Label>
      <Textarea readOnly placeholder="Длинный текст..." />
    </div>
  );
}