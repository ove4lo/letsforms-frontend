// components/builder/fields/NumberFieldProperties.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormElementInstance } from "../types";

type Props = {
  elementInstance: FormElementInstance;
  updateElement: (updated: FormElementInstance) => void;
};

export function NumberFieldProperties({ elementInstance, updateElement }: Props) {
  const attrs = elementInstance.extraAttributes || {};

  const updateAttr = (key: string, value: string | boolean | undefined) => {
    let processedValue: string | number | boolean | undefined = value;

    if (key === "min" || key === "max") {
      if (value === "" || value === undefined) {
        processedValue = undefined;
      } else {
        const num = Number(value);
        processedValue = isNaN(num) ? undefined : num;
      }
    }

    updateElement({
      ...elementInstance,
      extraAttributes: {
        ...attrs,
        [key]: processedValue,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base">Метка поля</Label>
        <Input
          value={attrs.label ?? ""}
          onChange={(e) => updateAttr("label", e.target.value)}
          placeholder="Например: Сколько вам лет?"
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base">Подсказка в поле</Label>
        <Input
          value={attrs.placeholder ?? ""}
          onChange={(e) => updateAttr("placeholder", e.target.value)}
          placeholder="Например: 25"
          className="mt-2"
        />
      </div>

      {/* Диапазон — теперь без NaN */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-base">Минимум</Label>
          <Input
            type="number"
            value={attrs.min ?? ""}
            onChange={(e) => updateAttr("min", e.target.value)}
            placeholder="Без ограничения"
            className="mt-2"
          />
        </div>
        <div>
          <Label className="text-base">Максимум</Label>
          <Input
            type="number"
            value={attrs.max ?? ""}
            onChange={(e) => updateAttr("max", e.target.value)}
            placeholder="Без ограничения"
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex items-center justify-between py-4">
        <Label className="text-base">Обязательное поле</Label>
        <Switch
          checked={!!attrs.required}
          onCheckedChange={(v) => updateAttr("required", v)}
        />
      </div>
    </div>
  );
}