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

export function TextFieldFormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: Props) {
  const { label, placeholder, required } = elementInstance.extraAttributes || {};

  return (
    <div className="space-y-2 w-full">
      <Label className={isInvalid ? "text-red-500" : ""}>
        {label || "Текстовое поле"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        placeholder={placeholder || "Введите текст..."}
        defaultValue={defaultValue}
        onChange={(e) => submitValue?.(elementInstance.id, e.target.value)}
        className={isInvalid ? "border-red-500" : ""}
      />
    </div>
  );
}