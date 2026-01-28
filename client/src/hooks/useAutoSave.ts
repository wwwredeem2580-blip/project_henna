import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  draftId: string | null;
  onSave: (data: T, draftId: string | null) => Promise<string>;
  interval?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  saveNow: () => Promise<void>;
}

export function useAutoSave<T>({
  data,
  draftId,
  onSave,
  interval = 3000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>(JSON.stringify(data));
  const isMountedRef = useRef(true);

  const saveData = useCallback(async () => {
    if (!enabled || isSaving) return;

    const currentData = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (currentData === lastDataRef.current) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      await onSave(data, draftId);
      
      if (isMountedRef.current) {
        lastDataRef.current = currentData;
        setLastSaved(new Date());
        setIsSaving(false);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to save draft');
        setIsSaving(false);
      }
      console.error('Auto-save error:', err);
    }
  }, [data, draftId, onSave, enabled, isSaving]);

  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await saveData();
  }, [saveData]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveData();
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, interval, enabled, saveData]);

  return {
    isSaving,
    lastSaved,
    error,
    saveNow,
  };
}
