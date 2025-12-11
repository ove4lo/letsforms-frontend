import { FormElementInstance } from "../types";

export function SpacerFieldForm({ elementInstance }: { elementInstance: FormElementInstance }) {
  const height = elementInstance.extraAttributes?.height || 48;
  return <div style={{ height: `${height}px` }} className="w-full" />;
}