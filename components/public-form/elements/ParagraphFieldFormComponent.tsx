import { FormElementInstance } from "@/components/builder/types";

interface Props {
  elementInstance: FormElementInstance;
}

export function ParagraphFieldFormComponent({ elementInstance }: Props) {
  const { text } = elementInstance.extraAttributes || {};

  return (
    <p className="text-muted-foreground leading-relaxed py-4">
      {text || "Здесь будет ваш текст..."}
    </p>
  );
}