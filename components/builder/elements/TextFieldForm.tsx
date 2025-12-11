"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormElementInstance } from "../types";

export function TextFieldForm({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { label, placeholder, required } = elementInstance.extraAttributes || {};

  return (
    <div className="space-y-2 w-full">
      <Label>
        {label || "Текстовое поле"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input placeholder={placeholder || "Введите текст..."} />
    </div>
  );
}