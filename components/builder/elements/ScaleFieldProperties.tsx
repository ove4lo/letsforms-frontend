import { FormElementInstance, PropertiesComponentProps } from "../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function ScaleFieldProperties({
  elementInstance,
  updateElement,
}: PropertiesComponentProps) {
  const { label = "Шкала оценки", required = false } = elementInstance.extraAttributes || {};

  const updateAttribute = (key: string, value: any) => {
    updateElement({
      ...elementInstance,
      extraAttributes: {
        ...elementInstance.extraAttributes,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6 p-1"> 
      <div className="space-y-2">
        <Label className="text-sm font-medium">Текст вопроса</Label>
        <Input
          value={label}
          onChange={(e) => updateAttribute("label", e.target.value)}
          placeholder="Например: Как вы оцениваете наш сервис?"
          className="w-full"
        />
      </div>

      <div className="flex items-center space-x-2 pt-4"> 
        <Checkbox
          checked={required}
          onCheckedChange={(checked) => updateAttribute("required", checked)}
        />
        <Label className="text-sm font-medium cursor-pointer">
          Обязательное поле
        </Label>
      </div>
    </div>
  );
}