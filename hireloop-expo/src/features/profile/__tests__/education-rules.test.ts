import {canUseEducationLevel, hasNoFormalEducation} from '../education-rules';
import type {ProfileEducation} from '../profile.types';

function education(id: number, educationLevel: string): ProfileEducation {
  return {
    id,
    educationLevel,
    schoolName: '',
    majorId: null,
    majorName: '',
    startDate: null,
    endDate: null,
    additionalInfo: '',
  };
}

describe('profile education rules', () => {
  it('treats Kurang dari SD as an exclusive education level', () => {
    const noFormal = education(1, 'Kurang dari SD');
    const diploma = education(2, 'D1');

    expect(hasNoFormalEducation([noFormal])).toBe(true);
    expect(canUseEducationLevel([noFormal], 'D1')).toBe(false);
    expect(canUseEducationLevel([diploma], 'Kurang dari SD')).toBe(false);
  });

  it('allows replacing the only Kurang dari SD entry with formal education', () => {
    expect(canUseEducationLevel([education(1, 'Kurang dari SD')], 'D1', 1)).toBe(true);
  });
});
