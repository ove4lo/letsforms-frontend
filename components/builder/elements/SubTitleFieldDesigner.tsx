import { DesignerElementProps } from "../types";

export function SubTitleFieldDesigner({ elementInstance }: DesignerElementProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-base font-medium text-muted-foreground">Подзаголовок</p>
      <p className="text-xs text-muted-foreground/60">Дополнительное описание</p>
    </div>
  );
}