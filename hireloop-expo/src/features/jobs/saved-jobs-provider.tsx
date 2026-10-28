import React, {createContext, PropsWithChildren, useCallback, useContext, useMemo, useState} from 'react';

import type {CandidateJobCard} from './jobs.types';

type SavedJobsContextValue = {
  savedJobs: CandidateJobCard[];
  isSaved: (key: string) => boolean;
  toggleSaved: (job: CandidateJobCard) => void;
};

const SavedJobsContext = createContext<SavedJobsContextValue | null>(null);

export function SavedJobsProvider({children}: PropsWithChildren) {
  const [savedByKey, setSavedByKey] = useState<Map<string, CandidateJobCard>>(() => new Map());

  const toggleSaved = useCallback((job: CandidateJobCard) => {
    setSavedByKey(current => {
      const next = new Map(current);
      if (next.has(job.key)) next.delete(job.key);
      else next.set(job.key, job);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    savedJobs: Array.from(savedByKey.values()),
    isSaved: (key: string) => savedByKey.has(key),
    toggleSaved,
  }), [savedByKey, toggleSaved]);

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>;
}

export function useSavedJobs(): SavedJobsContextValue {
  const context = useContext(SavedJobsContext);
  if (!context) throw new Error('useSavedJobs harus digunakan di dalam SavedJobsProvider.');
  return context;
}
