"use client";

import { FormElementInstance } from "@/components/builder/types";
import { FormElements } from "@/components/builder/elements/FormElements";
import { StatusSelector, FormStatus } from "@/components/StatusSelector";
import { useState, useEffect } from "react";
import { saveForm } from "@/lib/form";
import { LoadingCat } from "@/components/LoadingCat";
import { Textarea } from "@/components/ui/textarea";
import { PublishDialog } from "@/components/PublishDialog";
import { ErrorDialog } from "@/components/ErrorDialog";
import { Designer } from "@/components/builder/Designer";
import { useRouter } from "next/navigation";
import useLoadForm from "@/hooks/useLoadForm";
import useFormStatusActions from "@/hooks/useFormStatusActions";
import { AdminServerForm } from "@/types/form";
import {
    SaveButton,
    PublishButton,
    PreviewButton
} from "@/components/FormActionButtons";

interface BuilderPageClientProps {
    hash: string;
}

export default function BuilderPageClient({ hash }: BuilderPageClientProps) {
    const router = useRouter();
    const { formData, loading: loadingForm, error: loadError, refetch } = useLoadForm(hash);
    const { isUpdating: isStatusUpdating, error: statusError, updateStatus } = useFormStatusActions();

    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formStatus, setFormStatus] = useState<FormStatus>("draft");
    const [elements, setElements] = useState<FormElementInstance[]>([]);
    const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const [publishOpen, setPublishOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const hasQuestions = elements.some(el =>
        !["ParagraphField", "TitleField", "SubTitleField"].includes(el.type)
    );

    useEffect(() => {
        if (formData) {
            setFormTitle(formData.title || "Новая форма");
            setFormDescription(formData.description || "");
            setFormStatus(formData.status);

            if (formData.questions && formData.questions.length > 0) {
                const restoredElements = formData.questions.map((q: any) => {
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
    }, [formData]);

    const handleSave = async () => {
        try {
            await saveForm(hash, { title: formTitle, elements });
            alert("Форма успешно сохранена!");
        } catch (error: any) {
            console.error("Ошибка сохранения:", error);
            alert(`Ошибка: ${error.message || "Неизвестная ошибка"}`);
        }
    };

    const handleStatusChange = async (newStatus: FormStatus) => {
        if (newStatus === "active" && !hasQuestions) {
            setErrorMessage("Нельзя опубликовать форму без вопросов. Добавьте хотя бы один вопрос.");
            setErrorOpen(true);
            return;
        }

        if (newStatus === formStatus) return;

        try {
            await updateStatus(hash, newStatus);
            setFormStatus(newStatus);
            refetch();

            if (newStatus === "active") {
                setPublishOpen(true);
            }
        } catch (error: any) {
            console.error("Ошибка изменения статуса:", error);
            setErrorMessage(statusError || "Не удалось изменить статус формы");
            setErrorOpen(true);
        }
    };

    const handlePreview = () => {
        window.open(`/f/${hash}`, '_blank');
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
            info: "ParagraphField",   // ← здесь был баг — info → ParagraphField
        };
        return map[serverType] || "TextField";
    };

    if (loadError) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-xl text-destructive">Ошибка загрузки: {loadError}</p>
            </div>
        );
    }

    if (loading || loadingForm) {
        return (
            <div className="min-h-screen w-full bg-background">
                <LoadingCat message="Загрузка формы..." subMessage="Пожалуйста, подождите" />
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-xl text-muted-foreground">Форма не найдена</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
            <header className="border-b bg-background px-6 py-5 flex flex-col gap-5">
                {/* Заголовок и описание */}
                <div className="space-y-3">
                    <input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1 w-full"
                        placeholder="Название формы"
                    />
                    <Textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Описание формы (необязательно)"
                        className="text-muted-foreground resize-none bg-transparent min-h-[60px]"
                        rows={2}
                    />
                </div>

                {/* Блок действий + предупреждение */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {/* Левая часть — все кнопки */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
                        <PreviewButton onClick={handlePreview} />
                        <SaveButton onClick={handleSave} />
                        <StatusSelector
                            currentStatus={formStatus}
                            onChange={handleStatusChange}
                            disabled={isStatusUpdating}
                        />
                        <PublishButton
                            onClick={() => setPublishOpen(true)}
                            status={formStatus}
                            disabled={!hasQuestions}
                        />
                    </div>

                    {/* Правая часть — предупреждение (растягивается на всё оставшееся место) */}
                    {!hasQuestions && (
                        <div className="flex-1 min-w-0">
                            <div className="h-full flex items-center justify-center px-4 py-2.5 text-center text-sm font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800/60 rounded-lg">
                                ⚠️ Добавьте хотя бы один вопрос, чтобы опубликовать форму
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <Designer
                    elements={elements}
                    onElementsChange={setElements}
                    selectedElement={selectedElement}
                    onSelectedElementChange={setSelectedElement}
                />
            </main>

            <PublishDialog
                open={publishOpen}
                onOpenChange={setPublishOpen}
                hash={hash}
            />
            <ErrorDialog
                open={errorOpen}
                onOpenChange={setErrorOpen}
                errorMessage={errorMessage}
                title="Ошибка"
            />
        </div>
    );
}