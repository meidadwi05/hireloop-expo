import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState} from 'react';

import type {CandidateJobCard} from './jobs.types';

type SavedJobsContextValue = {
  hydrated: boolean;
  savedJobs: CandidateJobCard[];
  savedCount: number;
  isSaved: (key: string) => boolean;
  toggleSaved: (job: CandidateJobCard) => void;
};

const SAVED_JOBS_STORAGE_KEY = 'hireloop:candidate:saved-jobs:v1';

const SavedJobsContext = createContext<SavedJobsContextValue | null>(null);

export function SavedJobsProvider({children}: PropsWithChildren) {
  const [savedByKey, setSavedByKey] = useState<Map<string, CandidateJobCard>>(() => new Map());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(SAVED_JOBS_STORAGE_KEY)
      .then(value => {
        if (!active || !value) return;
        const parsed: unknown = JSON.parse(value);
        if (!Array.isArray(parsed)) return;
        const entries = parsed
          .filter((job): job is CandidateJobCard => Boolean(job && typeof job === 'object' && 'key' in job && typeof job.key === 'string'))
          .map(job => [job.key, job] as const);
        setSavedByKey(new Map(entries));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(SAVED_JOBS_STORAGE_KEY, JSON.stringify(Array.from(savedByKey.values())))
      .catch(() => undefined);
  }, [hydrated, savedByKey]);

  const toggleSaved = useCallback((job: CandidateJobCard) => {
    setSavedByKey(current => {
      const next = new Map(current);
      if (next.has(job.key)) next.delete(job.key);
      else next.set(job.key, job);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    hydrated,
    savedJobs: Array.from(savedByKey.values()),
    savedCount: savedByKey.size,
    isSaved: (key: string) => savedByKey.has(key),
    toggleSaved,
  }), [hydrated, savedByKey, toggleSaved]);

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>;
}

export function useSavedJobs(): SavedJobsContextValue {
  const context = useContext(SavedJobsContext);
  if (!context) throw new Error('useSavedJobs harus digunakan di dalam SavedJobsProvider.');
  return context;
}
