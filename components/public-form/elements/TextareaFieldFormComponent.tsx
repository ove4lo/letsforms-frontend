"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormElementInstance } from "@/components/builder/types";

interface Props {
  elementInstance: FormElementInstance;
  submitValue?: (id: string, value: string) => void;
  isInvalid?: boolean;
  defaultValue?: any; 
}

export function TextareaFieldFormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: Props) {
  const { label, placeholder, required } = elementInstance.extraAttributes || {};

  return (
    <div className="space-y-2 w-full">
      <Label className={isInvalid ? "text-red-500" : ""}>
        {label || "Текстовая область"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        placeholder={placeholder || "Введите текст..."}
        rows={5}
        defaultValue={defaultValue}
        onChange={(e) => submitValue?.(elementInstance.id, e.target.value)}
        className={isInvalid ? "border-red-500" : ""}
      />
    </div>
  );
}