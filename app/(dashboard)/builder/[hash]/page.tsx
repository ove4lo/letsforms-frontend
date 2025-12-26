"use client";

import { use } from "react";
import { Designer } from "@/components/builder/Designer";
import { PreviewDialogBtn } from "@/components/builder/PreviewDialogBtn";
import { FormElementInstance } from "@/components/builder/types";
import { useState, useEffect } from "react";
import { saveForm, getFormByHash, updateFormStatus } from "@/lib/form";
import { FormElements } from "@/components/builder/elements/FormElements";
import { LoadingCat } from "@/components/LoadingCat";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link2, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BuilderPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = use(params);

  const [formTitle, setFormTitle] = useState("Новая форма");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"draft" | "active" | "paused" | "archived">("draft");
  const [elements, setElements] = useState<FormElementInstance[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);
  const [loading, setLoading] = useState(true);

  const [publishOpen, setPublishOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<"web" | "tg" | null>(null);

  // Загружаем форму с сервера
  useEffect(() => {
    async function loadFormFromServer() {
      const data = await getFormByHash(hash);

      if (data) {
        setFormTitle(data.title || "Новая форма");
        setFormDescription(data.description || "");
        setFormStatus(data.status || "draft"); 

        if (data.questions && data.questions.length > 0) {
          const restoredElements = data.questions.map((q: any) => {
            const clientType = mapServerTypeToClient(q.type);

            return {
              id: q.id.toString(),
              type: clientType,
              extraAttributes: {
                label: q.text || "Без названия",
                required: q.is_required || false,
                options: q.options
                  ? (Array.isArray(q.options)
                    ? q.options
                    : q.options.split(",").map((s: string) => s.trim())
                  )
                  : undefined,
                placeholder: q.placeholder || undefined,
                min: q.min || undefined,
                max: q.max || undefined,
                min_label: q.min_label || undefined,
                max_label: q.max_label || undefined,
              },
            };
          });

          setElements(restoredElements);
        }
      }

      setLoading(false);
    }

    loadFormFromServer();
  }, [hash]);

  // Fallback на localStorage
  useEffect(() => {
    if (loading) return;

    const saved = localStorage.getItem(`form_${hash}`);
    if (saved && elements.length === 0) {
      try {
        const data = JSON.parse(saved);
        setFormTitle(data.title || formTitle);
        setFormDescription(data.description || formDescription);
        setElements(data.elements || []);
      } catch (e) {
        console.log("Не удалось загрузить из localStorage");
      }
    }
  }, [hash, loading]);

  const handleSave = async () => {
    try {
      await saveForm(hash, {
        title: formTitle,
        elements,
      });

      localStorage.setItem(`form_${hash}`, JSON.stringify({
        title: formTitle,
        description: formDescription,
        elements,
      }));

      alert("Форма успешно сохранена на сервере!");
    } catch (error) {
      alert("Ошибка сохранения на сервере");
      console.error(error);
    }
  };

  const handlePublish = async () => {
    if (formStatus === "active") {
      setPublishOpen(true);
      return;
    }

    try {
      await updateFormStatus(hash, "active");
      setFormStatus("active"); // обновляем локально
      setPublishOpen(true);
    } catch (error: any) {
      if (error.message.includes("уже имеет статус")) {
        setFormStatus("active");
        setPublishOpen(true);
      } else {
        alert("Ошибка публикации");
        console.error(error);
      }
    }
  };

  const statusConfig = {
    draft: { label: "Черновик", variant: "secondary" as const },
    active: { label: "Активна", variant: "default" as const },
    paused: { label: "Приостановлена", variant: "secondary" as const },
    archived: { label: "Архивирована", variant: "outline" as const },
  };

  const currentStatus = statusConfig[formStatus] || statusConfig.draft;

  const copyLink = (type: "web" | "tg") => {
    let link = "";
    if (type === "web") {
      link = `${window.location.origin}/f/${hash}`;
    } else {
      link = `t.me/${process.env.NEXT_PUBLIC_BOT_NAME}?start=form_${hash}`;
    }

    navigator.clipboard.writeText(link);
    setCopiedType(type);

    setTimeout(() => setCopiedType(null), 2000);
  };

  const mapServerTypeToClient = (serverType: string): keyof typeof FormElements => {
    const map: Record<string, keyof typeof FormElements> = {
      text: "TextField",
      text_area: "TextareaField",
      single_choice: "RadioField",
      select: "SelectField",
      multiple_choice: "CheckboxField",
      number: "NumberField",
      scale: "ScaleField",
      date: "DateField",
      info: "ParagraphField",
    };
    return map[serverType] || "TextField";
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <LoadingCat message="Загрузка формы..." subMessage="Пожалуйста, подождите" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="border-b bg-background px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-5xl flex items-center gap-4">
            <div className="flex-1">
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                placeholder="Название формы"
              />
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Описание формы (необязательно)"
                className="mt-2 text-muted-foreground resize-none bg-transparent"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <PreviewDialogBtn elements={elements} />

            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Сохранить
            </button>

            {formStatus !== "active" ? (
              <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Опубликовать
              </Button>
            ) : (
              <Button onClick={() => setPublishOpen(true)} variant="outline" className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Опубликовать
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1">
        <Designer
          elements={elements}
          onElementsChange={setElements}
          selectedElement={selectedElement}
          onSelectedElementChange={setSelectedElement}
        />
      </div>

      {/* Модальное окно с ссылками */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Форма опубликована!</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            {/* Ссылка на сайт */}
            <div>
              <p className="text-sm font-medium mb-2">Прямая ссылка на форму:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/f/${hash}`}
                  className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono"
                />
                <Button size="sm" variant="outline" onClick={() => copyLink("web")}>
                  {copiedType === "web" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Ссылка для Telegram */}
            <div>
              <p className="text-sm font-medium mb-2">Ссылка для Telegram бота:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`t.me/${process.env.NEXT_PUBLIC_BOT_NAME}?start=form_${hash}`}
                  className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all"
                />
                <Button size="sm" variant="outline" onClick={() => copyLink("tg")}>
                  {copiedType === "tg" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setPublishOpen(false)} className="w-full">
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!copiedType} onOpenChange={() => setCopiedType(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">Ссылка скопирована</DialogTitle>
          </DialogHeader>

          <div className="text-center py-6">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium">Ссылка скопирована!</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}