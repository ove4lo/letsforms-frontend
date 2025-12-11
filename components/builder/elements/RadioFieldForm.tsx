import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormElementInstance } from "../types";

export function RadioFieldForm({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { label, required, options = [] } = elementInstance.extraAttributes || {};

  return (
    <div className="space-y-3 w-full">
      <Label>
        {label || "Радиокнопки"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <RadioGroup>
        {options.map((opt: string) => (
          <div key={opt} className="flex items-center gap-3">
            <RadioGroupItem value={opt} id={opt} />
            <Label htmlFor={opt} className="cursor-pointer font-normal">
              {opt}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}