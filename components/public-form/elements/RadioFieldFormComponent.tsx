"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormElementInstance } from "@/components/builder/types";

interface Props {
  elementInstance: FormElementInstance;
  submitValue?: (id: string, value: string) => void;
  isInvalid?: boolean;
  defaultValue?: any;
}

export function RadioFieldFormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: Props) {
  const { label, required, options = [] } = elementInstance.extraAttributes || {};

  return (
    <div className="space-y-3 w-full">
      <Label className={isInvalid ? "text-red-500" : ""}>
        {label || "Радиокнопки"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <RadioGroup
        defaultValue={defaultValue}
        onValueChange={(value) => submitValue?.(elementInstance.id, value)}
      >
        {options.map((opt: string) => (
          <div key={opt} className="flex items-center gap-3">
            <RadioGroupItem value={opt} id={`${elementInstance.id}-${opt}`} />
            <Label htmlFor={`${elementInstance.id}-${opt}`} className="cursor-pointer font-normal">
              {opt}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}