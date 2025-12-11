import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormElementInstance } from "../types"; 

export function CheckboxFieldForm({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { label, required, options = [] } = elementInstance.extraAttributes || {};

  return (
    <div className="space-y-3 w-full">
      <Label>
        {label || "Чекбоксы"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="space-y-2">
        {options.map((opt: string) => (
          <div key={opt} className="flex items-center gap-3">
            <Checkbox id={opt} />
            <Label htmlFor={opt} className="cursor-pointer font-normal">
              {opt}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}