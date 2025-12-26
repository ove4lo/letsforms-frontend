import { FormElementInstance } from "@/components/builder/types";

interface Props {
  elementInstance: FormElementInstance;
}

export function SubTitleFieldFormComponent({ elementInstance }: Props) {
  const { text = "Подзаголовок" } = elementInstance.extraAttributes || {};
  return <h3 className="text-xl font-semibold text-muted-foreground">{text}</h3>;
}