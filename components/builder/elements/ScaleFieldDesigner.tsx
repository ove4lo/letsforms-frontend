import { FormElementInstance } from "../types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type Props = {
  elementInstance: FormElementInstance;
};

export function ScaleFieldDesigner({ elementInstance }: Props) {
  const { label = "Как вы оцениваете наш сервис?", required = false } = 
    elementInstance.extraAttributes || {};

  return (
    <div className="flex flex-col gap-3 w-full p-4 border rounded-lg bg-muted/20">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>10</span>
        </div>
        <Slider defaultValue={[6]} min={1} max={10} step={1} disabled />
        <p className="text-xs text-center text-muted-foreground">
          Шкала от 1 до 10
        </p>
      </div>
    </div>
  );
}