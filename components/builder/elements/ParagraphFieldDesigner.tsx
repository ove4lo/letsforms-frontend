import { DesignerElementProps } from "../types";

export function ParagraphFieldDesigner({ elementInstance }: DesignerElementProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Здесь будет ваш текст. Можно написать сколько угодно. Это просто параграф для описания.
      </p>
    </div>
  );
}