"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormElementInstance } from "@/components/builder/types";
import { useState, useEffect } from "react";

interface Props {
  elementInstance: FormElementInstance;
  submitValue?: (id: string, value: string[]) => void;
  isInvalid?: boolean;
  defaultValue?: any; 
}

export function CheckboxFieldFormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue = [],
}: Props) {
  const { label, required, options = [] } = elementInstance.extraAttributes || {};

  const [selected, setSelected] = useState<string[]>(defaultValue);

  useEffect(() => {
    submitValue?.(elementInstance.id, selected);
  }, [selected]);

  const toggleOption = (opt: string) => {
    setSelected(prev => 
      prev.includes(opt) 
        ? prev.filter(v => v !== opt)
        : [...prev, opt]
    );
  };

  return (
    <div className="space-y-3 w-full">
      <Label className={isInvalid ? "text-red-500" : ""}>
        {label || "Чекбоксы"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="space-y-2">
        {options.map((opt: string) => (
          <div key={opt} className="flex items-center gap-3">
            <Checkbox 
              id={`${elementInstance.id}-${opt}`} 
              checked={selected.includes(opt)}
              onCheckedChange={() => toggleOption(opt)}
            />
            <Label 
              htmlFor={`${elementInstance.id}-${opt}`} 
              className="cursor-pointer font-normal"
            >
              {opt}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}