import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormElementInstance } from "../types";

export function TextareaFieldForm({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { label, placeholder, required } = elementInstance.extraAttributes || {};

  return (
    <div className="space-y-2 w-full">
      <Label>
        {label || "Текстовая область"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        placeholder={placeholder || "Введите текст..."}
        rows={5}
      />
    </div>
  );
}