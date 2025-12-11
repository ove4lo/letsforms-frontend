import { FormElementInstance } from "../types";

export function SubTitleFieldForm({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { text } = elementInstance.extraAttributes || {};
  return (
    <h2 className="text-xl text-muted-foreground">
      {text || "Подзаголовок"}
    </h2>
  );
}