import AsyncStorage from '@react-native-async-storage/async-storage';

const REGISTER_DRAFT_KEY = 'hireloop:register-contact-draft';
const MAX_DRAFT_AGE_MS = 24 * 60 * 60 * 1000;

type RegisterContactDraft = {
  email: string;
  phone: string;
  savedAt: number;
};

export async function saveRegisterContactDraft(email: string, phone: string): Promise<void> {
  const value: RegisterContactDraft = {
    email: email.trim().toLowerCase(),
    phone: phone.replace(/[\s-]/g, ''),
    savedAt: Date.now(),
  };
  await AsyncStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify(value));
}

export async function loadRegisterContactDraft(email: string): Promise<RegisterContactDraft | null> {
  const raw = await AsyncStorage.getItem(REGISTER_DRAFT_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as RegisterContactDraft;
    const expired = !value.savedAt || Date.now() - value.savedAt > MAX_DRAFT_AGE_MS;
    const differentUser = value.email !== email.trim().toLowerCase();
    if (expired || differentUser) {
      await AsyncStorage.removeItem(REGISTER_DRAFT_KEY);
      return null;
    }
    return value;
  } catch {
    await AsyncStorage.removeItem(REGISTER_DRAFT_KEY);
    return null;
  }
}

export async function clearRegisterContactDraft(): Promise<void> {
  await AsyncStorage.removeItem(REGISTER_DRAFT_KEY);
}
