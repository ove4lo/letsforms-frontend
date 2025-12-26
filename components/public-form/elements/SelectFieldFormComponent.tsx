"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormElementInstance } from "@/components/builder/types";

interface Props {
  elementInstance: FormElementInstance;
  submitValue?: (id: string, value: string) => void;
  isInvalid?: boolean;
  defaultValue?: any; 
}

export function SelectFieldFormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: Props) {
  const { label, required, options = [] } = elementInstance.extraAttributes || {};

  return (
    <div className="space-y-2 w-full">
      <Label className={isInvalid ? "text-red-500" : ""}>
        {label || "Выпадающий список"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select 
        defaultValue={defaultValue}
        onValueChange={(value) => submitValue?.(elementInstance.id, value)}
      >
        <SelectTrigger className={isInvalid ? "border-red-500" : ""}>
          <SelectValue placeholder="Выберите вариант" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt: string) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}