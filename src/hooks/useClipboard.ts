import { useState, useCallback } from 'react';
import { useUIStore } from '../stores/uiStore';

export function useClipboard(timeout = 2000) {
  const [hasCopied, setHasCopied] = useState(false);
  const addToast = useUIStore((state) => state.addToast);

  const copy = useCallback(
    async (text: string, label = 'Copied to clipboard!') => {
      try {
        await navigator.clipboard.writeText(text);
        setHasCopied(true);
        addToast({
          type: 'success',
          title: label,
          description: text.length > 40 ? `${text.slice(0, 37)}...` : text,
        });
        setTimeout(() => setHasCopied(false), timeout);
        return true;
      } catch (err) {
        console.error('Failed to copy: ', err);
        addToast({
          type: 'error',
          title: 'Copy Failed',
          description: 'Could not access clipboard.',
        });
        return false;
      }
    },
    [addToast, timeout]
  );

  return { copy, hasCopied };
}
