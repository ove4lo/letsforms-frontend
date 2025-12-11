import { DesignerElementProps } from "../types";

export function SeparatorFieldDesigner({ elementInstance }: DesignerElementProps) {
  return (
    <div className="w-full py-4">
      <div className="h-px bg-muted-foreground/20"></div>
      <p className="text-center text-xs text-muted-foreground mt-2">Разделитель</p>
    </div>
  );
}