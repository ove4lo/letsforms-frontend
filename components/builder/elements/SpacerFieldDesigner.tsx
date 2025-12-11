import { DesignerElementProps } from "../types";

export function SpacerFieldDesigner({ elementInstance }: DesignerElementProps) {
  return (
    <div className="w-full py-8 flex items-center justify-center">
      <p className="text-xs text-muted-foreground">Отступ (Spacer)</p>
    </div>
  );
}