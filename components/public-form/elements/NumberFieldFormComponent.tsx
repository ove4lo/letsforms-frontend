"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormElementInstance } from "@/components/builder/types";

interface Props {
  elementInstance: FormElementInstance;
  submitValue?: (id: string, value: string) => void;
  isInvalid?: boolean;
  defaultValue?: any;
}

export function NumberFieldFormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: Props) {
  const { label, placeholder, required, min, max } = elementInstance.extraAttributes || {};

  const rangeHint = [];
  if (min !== undefined) rangeHint.push(`от ${min}`);
  if (max !== undefined) rangeHint.push(`до ${max}`);
  const rangeText = rangeHint.length > 0 ? `(${rangeHint.join(" ")})` : "";

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center gap-2">
        <Label className={isInvalid ? "text-red-500" : ""}>
          {label || "Числовое поле"}
          {required && <span className="text-red-500">*</span>}
        </Label>
        {rangeText && (
          <span className="text-sm text-muted-foreground">
            {rangeText}
          </span>
        )}
      </div>

      <Input
        type="number"
        placeholder={placeholder || "Введите число"}
        defaultValue={defaultValue}
        min={min}
        max={max}
        onChange={(e) => submitValue?.(elementInstance.id, e.target.value)}
        className={isInvalid ? "border-red-500" : ""}
      />
    </div>
  );
}