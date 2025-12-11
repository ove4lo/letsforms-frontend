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

  const updateAttr = (key: string, value: any) => {
    updateElement({
      ...elementInstance,
      extraAttributes: { ...attrs, [key]: value },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base">Метка поля</Label>
        <Input
          value={attrs.label || ""}
          onChange={(e) => updateAttr("label", e.target.value)}
          placeholder="Например: Сколько вам лет?"
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base">Подсказка в поле</Label>
        <Input
          value={attrs.placeholder || ""}
          onChange={(e) => updateAttr("placeholder", e.target.value)}
          placeholder="Например: 12"
          className="mt-2"
        />
      </div>

      <div className="flex items-center justify-between py-4">
        <Label className="text-base">Обязательное поле</Label>
        <Switch
          checked={attrs.required || false}
          onCheckedChange={(v) => updateAttr("required", v)}
        />
      </div>
    </div>
  );
}