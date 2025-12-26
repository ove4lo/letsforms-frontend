"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FormElementInstance } from "@/components/builder/types";

interface Props {
  elementInstance: FormElementInstance;
  submitValue?: (id: string, value: number) => void;
  isInvalid?: boolean;
  defaultValue?: any;
}

export function ScaleFieldFormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue = 5,
}: Props) {
  const { label, required, min = 1, max = 10, minLabel, maxLabel } = elementInstance.extraAttributes || {};

  return (
    <div className="space-y-4 w-full">
      <Label className={isInvalid ? "text-red-500" : ""}>
        {label || "Шкала оценки"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="space-y-3">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{minLabel || min}</span>
          <span>{maxLabel || max}</span>
        </div>

        <Slider
          defaultValue={[defaultValue]}
          min={Number(min)}
          max={Number(max)}
          step={1}
          onValueChange={(value) => submitValue?.(elementInstance.id, value[0])}
          className={isInvalid ? "[&_[role=slider]]:border-red-500" : ""}
        />

        <div className="text-center text-lg font-semibold">
          {defaultValue}
        </div>
      </div>
    </div>
  );
}