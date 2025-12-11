"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { FormElementInstance } from "../types";

type Props = {
  elementInstance: FormElementInstance;
  updateElement: (updated: FormElementInstance) => void;
};

export function CheckboxFieldProperties({ elementInstance, updateElement }: Props) {
  const attrs = elementInstance.extraAttributes || {};
  const options: string[] = attrs.options || ["Вариант 1", "Вариант 2"];

  const updateOptions = (newOptions: string[]) => {
    updateElement({
      ...elementInstance,
      extraAttributes: { ...attrs, options: newOptions },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <Label>Метка поля</Label>
        <Input
          value={attrs.label || ""}
          onChange={(e) =>
            updateElement({
              ...elementInstance,
              extraAttributes: { ...attrs, label: e.target.value },
            })
          }
          className="mt-2"
        />
      </div>

      <div>
        <Label>Варианты выбора</Label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mt-2">
            <Input
              value={opt}
              onChange={(e) => {
                const newOpts = [...options];
                newOpts[idx] = e.target.value;
                updateOptions(newOpts);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateOptions(options.filter((_, i) => i !== idx))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          className="mt-3 w-full"
          variant="outline"
          onClick={() => updateOptions([...options, `Вариант ${options.length + 1}`])}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить вариант
        </Button>
      </div>

      <div className="flex items-center justify-between py-4">
        <Label>Обязательное поле</Label>
        <Switch
          checked={attrs.required || false}
          onCheckedChange={(v) =>
            updateElement({
              ...elementInstance,
              extraAttributes: { ...attrs, required: v },
            })
          }
        />
      </div>
    </div>
  );
}