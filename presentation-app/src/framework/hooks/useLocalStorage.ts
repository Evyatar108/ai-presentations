import { useState, useCallback } from 'react';

/**
 * Generic localStorage hook with JSON serialization.
 * Returns [value, setValue] similar to useState.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) as T : initial;
    } catch {
      return initial;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored(prev => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // localStorage full or unavailable
      }
      return next;
    });
  }, [key]);

  return [stored, setValue];
}
