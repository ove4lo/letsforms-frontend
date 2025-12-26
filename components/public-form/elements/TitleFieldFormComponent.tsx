import { FormElementInstance } from "@/components/builder/types";

interface Props {
  elementInstance: FormElementInstance;
}

export function TitleFieldFormComponent({ elementInstance }: Props) {
  const { text = "Заголовок" } = elementInstance.extraAttributes || {};
  return <h2 className="text-3xl font-bold">{text}</h2>;
}