import { DesignerElementProps } from "../types";

export function SpacerFieldDesigner({ elementInstance }: DesignerElementProps) {
  const height = elementInstance.extraAttributes?.height || 48;
  return <div style={{ height: `${height}px` }} className="w-full" />;
}