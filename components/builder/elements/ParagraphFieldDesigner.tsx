import { DesignerElementProps } from "../types";

export function ParagraphFieldDesigner({ elementInstance }: DesignerElementProps) {
  const attrs = elementInstance.extraAttributes || {};
  return (
    <p className="text-muted-foreground leading-relaxed">
      {attrs.text || "Здесь будет ваш текст. Можно написать сколько угодно..."}
    </p>
  );
}