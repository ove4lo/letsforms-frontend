import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormElementInstance } from "../types";

export function SelectFieldForm({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { label, required, options = [] } = elementInstance.extraAttributes || {};

  return (
    <div className="space-y-2 w-full">
      <Label>
        {label || "Выпадающий список"}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Выберите вариант" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt: string) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}