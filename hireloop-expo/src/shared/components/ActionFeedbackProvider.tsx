import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';

import {toAppApiError} from '../../core/api/api-error';
import {ActionOverlayModal, type ActionOverlay} from './ActionOverlayModal';
import {withMinimumDelay} from '../utils/with-minimum-delay';

export type ActionFeedbackOptions<T> = {
  operation: () => Promise<T>;
  loadingMessage: string;
  successTitle: string;
  successMessage: string;
  errorTitle?: string;
  minimumLoadingDuration?: number;
  successDuration?: number;
  skipSuccessStatus?: boolean;
  onSuccessExit?: (result: T) => void | Promise<void>;
};

export type ActionFeedbackResult<T> =
  | {ok: true; data: T}
  | {ok: false; error: unknown};

type ActionFeedbackContextValue = {
  busy: boolean;
  runAction: <T>(options: ActionFeedbackOptions<T>) => Promise<ActionFeedbackResult<T>>;
  closeStatus: () => void;
};

const ActionFeedbackContext = createContext<ActionFeedbackContextValue | null>(null);

export function ActionFeedbackProvider({children}: React.PropsWithChildren) {
  const [overlay, setOverlay] = useState<ActionOverlay | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const actionIdRef = useRef(0);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successExitRef = useRef<(() => void | Promise<void>) | null>(null);

  useEffect(() => () => {
    mountedRef.current = false;
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
  }, []);

  const closeStatus = useCallback(() => {
    if (busyRef.current) return;
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = null;
    setOverlay(null);
    const exit = successExitRef.current;
    successExitRef.current = null;
    if (exit) void exit();
  }, []);

  const runAction = useCallback(async <T,>(options: ActionFeedbackOptions<T>): Promise<ActionFeedbackResult<T>> => {
    if (busyRef.current) return {ok: false, error: new Error('Aksi lain masih diproses.')};

    const actionId = ++actionIdRef.current;
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    successExitRef.current = null;
    busyRef.current = true;
    setBusy(true);
    setOverlay({kind: 'loading', message: options.loadingMessage});

    try {
      const data = await withMinimumDelay(options.operation, options.minimumLoadingDuration ?? 600);
      if (!mountedRef.current || actionId !== actionIdRef.current) return {ok: true, data};

      busyRef.current = false;
      setBusy(false);
      if (options.skipSuccessStatus) {
        setOverlay(null);
        await options.onSuccessExit?.(data);
        return {ok: true, data};
      }

      setOverlay({kind: 'success', title: options.successTitle, message: options.successMessage});
      successExitRef.current = () => options.onSuccessExit?.(data);
      exitTimerRef.current = setTimeout(() => {
        if (!mountedRef.current || actionId !== actionIdRef.current) return;
        closeStatus();
      }, options.successDuration ?? 1400);
      return {ok: true, data};
    } catch (error) {
      if (mountedRef.current && actionId === actionIdRef.current) {
        busyRef.current = false;
        setBusy(false);
        successExitRef.current = null;
        setOverlay({
          kind: 'error',
          title: options.errorTitle ?? 'Aksi Gagal',
          message: toAppApiError(error).message,
        });
      }
      return {ok: false, error};
    }
  }, [closeStatus]);

  return (
    <ActionFeedbackContext.Provider value={{busy, closeStatus, runAction}}>
      {children}
      {overlay ? <ActionOverlayModal overlay={overlay} onClose={closeStatus} /> : null}
    </ActionFeedbackContext.Provider>
  );
}

export function useActionFeedback() {
  const context = useContext(ActionFeedbackContext);
  if (!context) throw new Error('useActionFeedback harus digunakan di dalam ActionFeedbackProvider.');
  return context;
}
