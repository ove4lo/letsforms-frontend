"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string;
  title?: string;
}

export function ErrorDialog({
  open,
  onOpenChange,
  errorMessage,
  title = "Ошибка",
}: ErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-red-600">
            <AlertTriangle className="h-8 w-8" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-lg text-foreground text-center">
            {errorMessage}
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
            Понятно
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}