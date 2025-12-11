import { DesignerElementProps } from "../types";

export function SubTitleFieldDesigner({ elementInstance }: DesignerElementProps) {
  const attrs = elementInstance.extraAttributes || {};
  return (
    <h2 className="text-xl text-muted-foreground">
      {attrs.text || "Подзаголовок"}
    </h2>
  );
}