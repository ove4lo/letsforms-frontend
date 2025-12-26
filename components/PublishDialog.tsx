"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hash: string;
}

export function PublishDialog({ open, onOpenChange, hash }: PublishDialogProps) {
  const [copiedType, setCopiedType] = useState<"web" | "tg" | null>(null);

  const webLink = `${window.location.origin}/f/${hash}`;
  const tgLink = `t.me/${process.env.NEXT_PUBLIC_BOT_NAME}?start=form_${hash}`;

  const copyLink = (link: string, type: "web" | "tg") => {
    navigator.clipboard.writeText(link);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Форма опубликована!</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          {/* Ссылка на сайт */}
          <div>
            <p className="text-sm font-medium mb-2">Прямая ссылка:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webLink}
                className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono"
              />
              <Button size="sm" variant="outline" onClick={() => copyLink(webLink, "web")}>
                {copiedType === "web" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Ссылка для Telegram */}
          <div>
            <p className="text-sm font-medium mb-2">Ссылка для бота:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={tgLink}
                className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all"
              />
              <Button size="sm" variant="outline" onClick={() => copyLink(tgLink, "tg")}>
                {copiedType === "tg" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}