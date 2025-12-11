import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DesignerElementProps } from "../types";

export function NumberFieldDesigner({ elementInstance }: DesignerElementProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">Числовое поле</Label>
      <Input type="number" readOnly placeholder="123" />
    </div>
  );
}