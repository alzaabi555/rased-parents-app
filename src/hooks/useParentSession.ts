import { useCallback, useEffect, useRef } from 'react';
import { clearSessionCode, getSavedSessionCode } from '../services/parentStorageService';
interface Args { loadStudent: (code:string, manual?:boolean, silent?:boolean)=>Promise<void>; }
export const useParentSession = ({ loadStudent }: Args) => {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const code = getSavedSessionCode();
    if (!code) return;
    void loadStudent(code);
    const timer = window.setInterval(() => { void loadStudent(code, false, true); }, 60000);
    return () => window.clearInterval(timer);
  }, [loadStudent]);
  const clearSession = useCallback(() => clearSessionCode(), []);
  return { clearSession };
};
