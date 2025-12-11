import { DesignerElementProps } from "../types";

export function TitleFieldDesigner({ elementInstance }: DesignerElementProps) {
  const attrs = elementInstance.extraAttributes || {};
  return (
    <h1 className="text-3xl font-bold text-foreground">
      {attrs.text || "Заголовок формы"}
    </h1>
  );
}