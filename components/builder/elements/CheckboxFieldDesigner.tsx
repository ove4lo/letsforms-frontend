import { Label } from "@/components/ui/label";
import { Square } from "lucide-react";
import { DesignerElementProps } from "../types";

export function CheckboxFieldDesigner({ elementInstance }: DesignerElementProps) {
  return (
    <div className="flex items-center gap-3">
      <Square className="h-5 w-5 text-muted-foreground" />
      <Label className="text-muted-foreground">Чекбокс</Label>
    </div>
  );
}