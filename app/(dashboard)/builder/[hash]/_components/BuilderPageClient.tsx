"use client";
import { useBuilder } from "@/hooks/useBuilder";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { DesignerLayout } from "@/components/builder/DesignerLayout";
import { PublishDialog } from "@/components/PublishDialog";
import { ErrorDialog } from "@/components/ErrorDialog";
import { LoadingCat } from "@/components/ui/loading-cat";
import { PageError } from "@/components/ui/page-error";
import { FormElementInstance } from "@/components/builder/types";

interface BuilderClientProps {
  hash: string;
}

export default function BuilderPageClient({ hash }: BuilderClientProps) {
  const {
    loading,
    error,
    refetch,
    title,
    description,
    status,
    elements,
    selectedElement,
    isSaving,
    publishOpen,
    errorOpen,
    errorMessage,
    setTitle,
    setDescription,
    setElements,
    setSelectedElement,
    handleSave,
    handleStatusChange,
    setPublishOpen,
    setErrorOpen,
  } = useBuilder(hash);

  const hasQuestions = elements.some((el: FormElementInstance) =>
    ![
      "ParagraphField",
      "TitleField",
      "SubTitleField",
      "SeparatorField",
      "SpacerField",
    ].includes(el.type)
  );

  const handleSaveWithValidation = async () => {
    if (!hasQuestions) {
      alert("⚠️ Ошибка сохранения:\n\nФорма должна содержать хотя бы один вопрос.");
      return;
    }
    try {
      await handleSave();
    } catch (e) {
      console.error("Ошибка при сохранении:", e);
    }
  };

  const handleStatusChangeWithValidation = async (newStatus: any) => {
    if (!hasQuestions && newStatus === "active") {
      alert("⚠️ Нельзя опубликовать пустую форму. Добавьте вопросы.");
      return;
    }
    await handleStatusChange(newStatus);
  };

  if (loading) {
    return (
      <LoadingCat
        message="Загрузка конструктора..."
        subMessage="Готовим инструменты"
      />
    );
  }

  if (error || !hash) {
    return (
      <PageError
        title="Ошибка"
        message={error || "Форма не найдена"}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden overflow-x-hidden bg-background">
      <BuilderHeader
        title={title}
        description={description}
        status={status}
        isSaving={isSaving}
        hasQuestions={hasQuestions}
        elements={elements} 
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onSave={handleSaveWithValidation}
        onStatusChange={handleStatusChangeWithValidation}
      />
      
      <main className="flex-1 flex relative w-full overflow-hidden">
        <DesignerLayout
          elements={elements}
          setElements={setElements}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
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
        errorMessage={errorMessage || "Произошла неизвестная ошибка"}
        title="Ошибка"
      />
    </div>
  );
}