import {isNoFormalEducation} from '../onboarding/onboarding.options';
import type {ProfileEducation} from './profile.types';

export function hasNoFormalEducation(items: ProfileEducation[]): boolean {
  return items.some(item => isNoFormalEducation(item.educationLevel));
}

export function canUseEducationLevel(
  items: ProfileEducation[],
  level: string,
  editingId: number | null = null,
): boolean {
  const others = items.filter(item => item.id !== editingId);
  if (isNoFormalEducation(level)) return others.length === 0;
  return !hasNoFormalEducation(others);
}
