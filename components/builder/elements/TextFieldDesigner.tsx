import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DesignerElementProps } from "../types";

export function TextFieldDesigner({ elementInstance }: DesignerElementProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Текстовое поле</Label>
      <Input readOnly placeholder="Текст здесь..." />
    </div>
  );
}