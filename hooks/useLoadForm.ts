import { useState, useEffect, useRef, useCallback } from 'react';
import { getFormByHash } from '@/lib/form';
import { AdminServerForm } from '@/types/form';

interface UseLoadFormReturn {
  formData: AdminServerForm | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useLoadForm = (hash: string): UseLoadFormReturn => {
  const [formData, setFormData] = useState<AdminServerForm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  const loadData = useCallback(async () => {
    if (!hash) {
      if (mountedRef.current) {
        setError('Хэш формы не указан');
        setLoading(false);
      }
      return;
    }

    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const data = await getFormByHash(hash);
      if (mountedRef.current) {
        if (data) {
          setFormData(data);
        } else {
          setError('Форма не найдена');
          setFormData(null);
        }
      }
    } catch (err: any) {
      if (mountedRef.current) {
        console.error('Ошибка загрузки формы в useLoadForm:', err);
        setError(err.message || 'Произошла ошибка при загрузке формы');
        setFormData(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, [hash]);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  return { 
    formData, 
    loading, 
    error, 
    refetch: loadData 
  };
};

export default useLoadForm;