"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormElementInstance } from "@/components/builder/types";
import { useState } from "react";
import { useEffect } from "react";

interface Props {
  elementInstance: FormElementInstance;
  submitValue?: (id: string, value: string) => void;
  isInvalid?: boolean;
  defaultValue?: any; 
}

export function DateFieldFormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: Props) {
  const { label, required } = elementInstance.extraAttributes || {};
  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined
  );

  useEffect(() => {
    if (date) {
      submitValue?.(elementInstance.id, format(date, "yyyy-MM-dd"));
    }
  }, [date]);

  return (
    <div className="space-y-2 w-full">
      <Label className={isInvalid ? "text-red-500" : ""}>
        {label || "Дата"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={`w-full justify-start text-left font-normal ${isInvalid ? "border-red-500" : ""}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd.MM.yyyy") : "Выберите дату"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar 
            mode="single" 
            selected={date} 
            onSelect={setDate} 
            initialFocus 
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}