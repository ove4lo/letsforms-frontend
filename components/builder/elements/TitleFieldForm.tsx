import { FormElementInstance } from "../types";

export function TitleFieldForm({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { text } = elementInstance.extraAttributes || {};
  return <h1 className="text-3xl font-bold">{text || "Заголовок формы"}</h1>;
}