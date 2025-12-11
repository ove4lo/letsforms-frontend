"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormElementInstance } from "../types";

type Props = {
  elementInstance: FormElementInstance;
  updateElement: (updated: FormElementInstance) => void;
};

export function ParagraphFieldProperties({ elementInstance, updateElement }: Props) {
  const attrs = elementInstance.extraAttributes || {};

  return (
    <div>
      <Label>Текст</Label>
      <Textarea
        value={attrs.text || ""}
        onChange={(e) =>
          updateElement({
            ...elementInstance,
            extraAttributes: { ...attrs, text: e.target.value },
          })
        }
        className="mt-2"
        rows={3}
      />
    </div>
  );
}