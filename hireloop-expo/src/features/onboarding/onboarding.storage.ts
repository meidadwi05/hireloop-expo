import AsyncStorage from '@react-native-async-storage/async-storage';

import type {OnboardingDraft, OnboardingState} from './onboarding.types';

const DRAFT_VERSION = 1;
const MAX_DRAFT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type StoredOnboardingDraft = {
  version: number;
  savedAt: number;
  step: OnboardingState['step'];
  draft: OnboardingDraft;
};

function storageKey(userId: number | string) {
  return `hireloop:onboarding:${userId}`;
}

export async function loadOnboardingDraft(userId: number | string): Promise<StoredOnboardingDraft | null> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as StoredOnboardingDraft;
    if (stored.version !== DRAFT_VERSION || !stored.draft || Date.now() - stored.savedAt > MAX_DRAFT_AGE_MS) {
      await AsyncStorage.removeItem(storageKey(userId));
      return null;
    }
    return stored;
  } catch {
    await AsyncStorage.removeItem(storageKey(userId));
    return null;
  }
}

export async function saveOnboardingDraft(userId: number | string, step: OnboardingState['step'], draft: OnboardingDraft) {
  const value: StoredOnboardingDraft = {version: DRAFT_VERSION, savedAt: Date.now(), step, draft};
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(value));
}

export async function clearOnboardingDraft(userId: number | string) {
  await AsyncStorage.removeItem(storageKey(userId));
}

