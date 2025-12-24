// components/builder/fields/NumberFieldForm.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormElementInstance } from "../types";
import { useFormContext } from "react-hook-form";

type Props = {
  elementInstance: FormElementInstance;
};

export function NumberFieldForm({ elementInstance }: Props) {
  const { label, placeholder, required, min, max } = elementInstance.extraAttributes || {};

  const rangeHint = [];
  if (min !== undefined) rangeHint.push(`от ${min}`);
  if (max !== undefined) rangeHint.push(`до ${max}`);
  const rangeText = rangeHint.length > 0 ? `(${rangeHint.join(" ")})` : "";

  // Попытка получить register, если есть FormProvider
  let register;
  try {
    const context = useFormContext();
    register = context?.register;
  } catch (error) {
    // Нет FormProvider — это превью
    register = undefined;
  }

  const fieldName = elementInstance.id;

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center gap-2">
        <Label className="font-medium">
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
        className="w-full"
        {...(register ? register(fieldName, {
          required: required ? "Это поле обязательно" : false,
          min: min !== undefined ? { value: min, message: `Минимальное значение: ${min}` } : undefined,
          max: max !== undefined ? { value: max, message: `Максимальное значение: ${max}` } : undefined,
          valueAsNumber: true,
        }) : {})}
      />
    </div>
  );
}