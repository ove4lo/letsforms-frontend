import { useState, useEffect, useRef } from 'react';
import { getMyForms } from '@/lib/form';
import { GetMyFormsResponse, FormSummary, UserStatistics } from '@/types/form';

interface UseLoadMyFormsReturn {
  data: GetMyFormsResponse | null;
  forms: FormSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useLoadMyForms = (): UseLoadMyFormsReturn => {
  const [data, setData] = useState<GetMyFormsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  // Функция для расчета корректной статистики на основе форм
  const calculateCorrectStats = (forms: FormSummary[]): UserStatistics => {
    console.log("🧮 РАСЧЕТ СТАТИСТИКИ ВРУЧНУЮ ");
    
    let totalVisits = 0;
    let totalResponses = 0;
    
    forms.forEach(form => {
      totalVisits += form.visit_count || 0;
      totalResponses += form.response_count || 0;
    });
    
    const overallConversionRate = totalVisits > 0 
      ? Number(((totalResponses / totalVisits) * 100).toFixed(1))
      : 0;
      
    const overallBounceRate = totalVisits > 0
      ? Number((((totalVisits - totalResponses) / totalVisits) * 100).toFixed(1))
      : 0;
    
    const activeFormsCount = forms.filter(f => f.status === 'active').length;
    const draftFormsCount = forms.filter(f => f.status === 'draft').length;
    
    const calculatedStats = {
      total_forms: forms.length,
      total_visits: totalVisits,
      total_responses: totalResponses,
      overall_conversion_rate: overallConversionRate,
      overall_bounce_rate: overallBounceRate,
      active_forms_count: activeFormsCount,
      draft_forms_count: draftFormsCount,
      user_id: 0, 
      username: '',
      telegram_id: 0
    };
    
    console.log("🧮 Рассчитанная статистика:", calculatedStats);
    console.log("🧮 КОНЕЦ РАСЧЕТА\n");
    
    return calculatedStats;
  };

  const loadData = async () => {
    console.log("🔄 useLoadMyForms: ЗАГРУЗКА ");
    console.log("🔄 Время:", new Date().toISOString());
    
    if (loadingRef.current) {
      console.log("🔄 Загрузка уже выполняется, пропускаем");
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log("🔄 Вызов getMyForms()...");
      const result = await getMyForms();
      
      console.log("🔄 ПОЛУЧЕН ОТВЕТ:", result);
      
      // Если есть формы, пересчитываем статистику
      if (result.results && result.results.length > 0) {
        console.log("🔄 ВНИМАНИЕ: Пересчитываем статистику вручную из-за несоответствия на сервере");
        
        // Рассчитываем правильную статистику
        const correctStats = calculateCorrectStats(result.results);
        
        // Сравниваем с тем, что пришло с сервера
        if (result.user_statistics) {
          console.log("🔄 СРАВНЕНИЕ СТАТИСТИКИ:");
          console.log("  - С сервера (responses):", result.user_statistics.total_responses);
          console.log("  - Рассчитано (responses):", correctStats.total_responses);
          console.log("  - Разница:", correctStats.total_responses - (result.user_statistics.total_responses || 0));
        }
        
        // Заменяем статистику на рассчитанную
        result.user_statistics = correctStats;
      }
      
      // Анализ форм
      if (result.results) {
        console.log("🔄 АНАЛИЗ ФОРМ:");
        console.log("🔄 Всего форм:", result.results.length);
        
        let totalVisits = 0;
        let totalResponses = 0;
        let formsWithVisits = 0;
        let formsWithResponses = 0;
        
        result.results.forEach((form, idx) => {
          console.log(`🔄 Форма ${idx + 1} [${form.hash}]:`, {
            title: form.title,
            status: form.status,
            visits: form.visit_count,
            responses: form.response_count,
            conversion: form.conversion_rate
          });
          
          totalVisits += form.visit_count || 0;
          totalResponses += form.response_count || 0;
          
          if (form.visit_count > 0) formsWithVisits++;
          if (form.response_count > 0) formsWithResponses++;
        });
        
        console.log("🔄 ИТОГО ПО ФОРМАМ:", {
          total_visits: totalVisits,
          total_responses: totalResponses,
          forms_with_visits: formsWithVisits,
          forms_with_responses: formsWithResponses
        });
      }
      
      if (mountedRef.current) {
        setData(result);
        console.log("🔄 Данные сохранены в state с исправленной статистикой");
      }
    } catch (err: any) {
      if (mountedRef.current) {
        console.error('🔄 Ошибка загрузки:', err);
        setError(err.message || 'Произошла ошибка при загрузке форм');
        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        console.log("🔄 Загрузка завершена");
      }
      loadingRef.current = false;
      console.log("🔄 КОНЕЦ ЗАГРУЗКИ\n");
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    
    return () => {
      console.log("🔄 useLoadMyForms: компонент размонтирован");
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    forms: data?.results || [],
    loading,
    error,
    refetch: loadData,
  };
};

export default useLoadMyForms;