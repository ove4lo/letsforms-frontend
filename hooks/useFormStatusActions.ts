import { useState, useRef, useCallback } from 'react';
import { updateFormStatus } from '@/lib/form';
import { FormStatus } from '@/types/form';

interface UseFormStatusActionsReturn {
  isUpdating: boolean;
  error: string | null;
  updateStatus: (hash: string, newStatus: FormStatus) => Promise<void>;
}

const useFormStatusActions = (): UseFormStatusActionsReturn => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const updatingRef = useRef(false);

  const updateStatus = useCallback(async (hash: string, newStatus: FormStatus) => {
    if (updatingRef.current) return;
    
    updatingRef.current = true;
    setIsUpdating(true);
    setError(null);
    
    try {
      await updateFormStatus(hash, newStatus);
    } catch (err: any) {
      console.error('Ошибка обновления статуса:', err);
      setError(err.message || 'Не удалось обновить статус');
    } finally {
      setIsUpdating(false);
      updatingRef.current = false;
    }
  }, []);

  return { isUpdating, error, updateStatus };
};

export default useFormStatusActions;