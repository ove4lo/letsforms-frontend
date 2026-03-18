"use client";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormElementInstance } from "./types";
import { FormElements } from "./elements/FormElements";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  elements: FormElementInstance[];
  isMobile?: boolean;
};

export function PreviewDialogBtn({ elements, isMobile }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size={isMobile ? "icon" : "sm"}
          className={cn(
            "rounded-full",
            isMobile ? "h-8 w-8" : "h-9 px-4 gap-2"
          )}
          title="Предпросмотр"
        >
          <Eye className="h-4 w-4" />
          {!isMobile && "Предпросмотр"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Предпросмотр формы</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-8 bg-background/95">
          <div className="max-w-2xl mx-auto space-y-6">
            {elements.map((element) => {
              const FormComponent = FormElements[element.type].formComponent;
              return <FormComponent key={element.id} elementInstance={element} />;
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}