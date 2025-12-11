"use client";

import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DesignerElementProps } from "../types";

export function DateFieldDesigner({ elementInstance }: DesignerElementProps) {
  const attrs = elementInstance.extraAttributes || {};
  const defaultDate = attrs.defaultValue ? new Date(attrs.defaultValue) : null;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-muted-foreground">
        {attrs.label || "Дата"}
        {attrs.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-background cursor-pointer hover:bg-muted/50 transition">
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        <span className="text-muted-foreground">
          {defaultDate ? format(defaultDate, "dd.MM.yyyy") : "Выберите дату"}
        </span>
      </div>
    </div>
  );
}