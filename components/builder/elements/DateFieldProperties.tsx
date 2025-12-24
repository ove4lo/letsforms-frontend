"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormElementInstance } from "../types";

type Props = {
  elementInstance: FormElementInstance;
  updateElement: (updated: FormElementInstance) => void;
};

export function DateFieldProperties({ elementInstance, updateElement }: Props) {
  const attrs = elementInstance.extraAttributes || {};
  const selectedDate = attrs.defaultValue ? new Date(attrs.defaultValue) : undefined;

  const updateAttr = (key: string, value: any) => {
    updateElement({
      ...elementInstance,
      extraAttributes: { ...attrs, [key]: value },
    });
  };

  return (
    <div className="space-y-8">
      {/* Метка поля */}
      <div>
        <Label className="text-base">Метка поля</Label>
        <Input
          value={attrs.label || ""}
          onChange={(e) => updateAttr("label", e.target.value)}
          placeholder="Например: Дата рождения"
          className="mt-2"
        />
      </div>

      {/* Значение по умолчанию (календарь)
      <div>
        <Label className="text-base">Значение по умолчанию</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal mt-2"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "dd.MM.yyyy") : "Не выбрано"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                updateAttr("defaultValue", date ? date.toISOString() : null);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div> */}

      {/* Обязательное поле */}
      <div className="flex items-center justify-between py-4">
        <Label className="text-base">Обязательное поле</Label>
        <Switch
          checked={attrs.required || false}
          onCheckedChange={(checked) => updateAttr("required", checked)}
        />
      </div>
    </div>
  );
}