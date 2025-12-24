"use client";

import { FormElementInstance } from "../types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type Props = {
  elementInstance: FormElementInstance;
};

export function ScaleFieldForm({ elementInstance }: Props) {
  const { label = "Шкала оценки", required = false } = elementInstance.extraAttributes || {};

  return (
    <div className="flex flex-col gap-4 w-full">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>1</span>
          <span>10</span>
        </div>
        <Slider defaultValue={[5]} min={1} max={10} step={1} />
        <p className="text-xs text-center text-muted-foreground">
          Ползунок для оценки от 1 до 10
        </p>
      </div>
    </div>
  );
}