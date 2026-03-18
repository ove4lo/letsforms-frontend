import { useState, useEffect, useRef } from 'react';
import { getFormByHash } from '@/lib/form';
import { AdminServerForm, ServerQuestion } from '@/types/form';
import { FormElementInstance } from "@/components/builder/types";
import { PublicElementsType } from "@/components/public-form/elements/PublicFormElements";

interface UseLoadPublicFormReturn {
  form: AdminServerForm | null;
  elements: FormElementInstance[];
  loading: boolean;
  error: string | null;
}

const useLoadPublicForm = (hash: string): UseLoadPublicFormReturn => {
  const [form, setForm] = useState<AdminServerForm | null>(null);
  const [elements, setElements] = useState<FormElementInstance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  const mapServerTypeToClient = (serverType: string): PublicElementsType => {
    const map: Record<string, PublicElementsType> = {
      text: "TextField",
      text_area: "TextareaField",
      single_choice: "RadioField",
      select: "SelectField",
      multiple_choice: "CheckboxField",
      number: "NumberField",
      scale: "ScaleField",
      date: "DateField",
      info: "ParagraphField",
      title: "TitleField",
      subtitle: "SubTitleField",
    };
    return map[serverType] || "TextField";
  };

  const loadData = async () => {
    if (!hash) {
      if (mountedRef.current) {
        setError('Хэш формы не указан');
        setLoading(false);
      }
      return;
    }

    // Защита от множественных вызовов 
    if (loadingRef.current) {
      return;
    }
    
    loadingRef.current = true;
    
    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const data = await getFormByHash(hash);
      
      if (mountedRef.current) {
        if (data) {
          setForm(data);
          
          // Преобразуем вопросы в элементы
          if (data.questions?.length > 0) {
            const restored = data.questions.map((q: ServerQuestion) => {
              const clientType = mapServerTypeToClient(q.type);
              
              return {
                id: q.id.toString(),
                type: clientType,
                extraAttributes: {
                  label: q.text || "Без названия",
                  required: q.is_required || false,
                  placeholder: q.placeholder || undefined,
                  options: q.options ? (Array.isArray(q.options) ? q.options : []) : undefined,
                  min: q.min || undefined,
                  max: q.max || undefined,
                  min_label: q.min_label || undefined,
                  max_label: q.max_label || undefined,
                },
              };
            });
            setElements(restored);
          }
        } else {
          setError('Форма не найдена');
          setForm(null);
          setElements([]);
        }
      }
    } catch (err: any) {
      if (mountedRef.current) {
        console.error('Ошибка загрузки формы:', err);
        setError(err.message || 'Произошла ошибка при загрузке формы');
        setForm(null);
        setElements([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [hash]); // Зависимость только от hash

  return {
    form,
    elements,
    loading,
    error,
  };
};

export default useLoadPublicForm;