import { FormElementInstance } from "../types"; 

export function ParagraphFieldForm({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { text } = elementInstance.extraAttributes || {};
  return (
    <p className="text-muted-foreground leading-relaxed">
      {text || "Здесь будет ваш текст..."}
    </p>
  );
}