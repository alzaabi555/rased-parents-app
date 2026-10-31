import { useCallback } from 'react';
import { clearSessionCode } from '../services/parentStorageService';

interface UseParentSessionArgs {
  loadStudent: (code: string, manual?: boolean, silent?: boolean) => Promise<void>;
}

/**
 * Session controls for Rased Parent.
 *
 * Important: opening the app must never load the last student automatically.
 * The parent always starts from the login / saved-children screen and chooses
 * the required child explicitly.
 *
 * loadStudent remains in the public contract to avoid changing App.tsx or any
 * existing callers during this focused fix.
 */
export const useParentSession = ({ loadStudent: _loadStudent }: UseParentSessionArgs) => {
  const clearSession = useCallback(() => {
    clearSessionCode();
  }, []);

  return { clearSession };
};
