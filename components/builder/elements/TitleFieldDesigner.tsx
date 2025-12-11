import { DesignerElementProps } from "../types";

export function TitleFieldDesigner({ elementInstance }: DesignerElementProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-lg font-bold text-muted-foreground">Заголовок формы</p>
      <p className="text-sm text-muted-foreground/70">Нажмите, чтобы изменить</p>
    </div>
  );
}