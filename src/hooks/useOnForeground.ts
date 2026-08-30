import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useOnForeground(callback: () => void): void {
  const ref = useRef(callback);
  ref.current = callback;
  useEffect(() => {
    let previous = String(AppState.currentState ?? 'unknown');
    const subscription = AppState.addEventListener('change', next => {
      if (/inactive|background/.test(previous) && next === 'active') ref.current();
      previous = String(next);
    });
    return () => subscription.remove();
  }, []);
}
