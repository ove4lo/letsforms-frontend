import { useState, useEffect, useRef } from 'react';
import { getMyForms } from '@/lib/form';
import { GetMyFormsResponse, FormSummary } from '@/types/form';

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

  const loadData = async () => {
    // Защита от множественных вызовов
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const result = await getMyForms();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        console.error('Ошибка загрузки моих форм в хуке:', err);
        setError(err.message || 'Произошла ошибка при загрузке форм');
        setData(null);
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