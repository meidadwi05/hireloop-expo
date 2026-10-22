import type {OnboardingAction, OnboardingState, SkillOption} from './onboarding.types';

function upsertById<T extends {id: string}>(items: T[], item: T): T[] {
  const index = items.findIndex(existing => existing.id === item.id);
  if (index < 0) return [...items, item];
  return items.map(existing => existing.id === item.id ? item : existing);
}

function selectedSkill(skill: SkillOption) {
  return {skillId: skill.id, customName: null, name: skill.name};
}

export function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'hydrate':
      return {...state, draft: action.draft};
    case 'set-step':
      return {...state, step: action.step};
    case 'set-field': {
      const draft = {...state.draft, [action.field]: action.value};
      if (action.field === 'domicileSameAsIdentity' && action.value === true) {
        draft.domicileAddress = {...state.draft.identityAddress};
      }
      return {...state, draft};
    }
    case 'set-address': {
      const draft = {...state.draft, [action.target]: action.address};
      if (action.target === 'identityAddress' && state.draft.domicileSameAsIdentity) {
        draft.domicileAddress = {...action.address};
      }
      return {...state, draft};
    }
    case 'set-education':
      return {...state, draft: {...state.draft, educations: upsertById(state.draft.educations, action.education)}};
    case 'remove-education':
      return {...state, draft: {...state.draft, educations: state.draft.educations.filter(item => item.id !== action.id)}};
    case 'set-experience':
      return {...state, draft: {...state.draft, experiences: upsertById(state.draft.experiences, action.experience)}};
    case 'remove-experience':
      return {...state, draft: {...state.draft, experiences: state.draft.experiences.filter(item => item.id !== action.id)}};
    case 'set-certification':
      return {...state, draft: {...state.draft, certifications: upsertById(state.draft.certifications, action.certification)}};
    case 'remove-certification':
      return {...state, draft: {...state.draft, certifications: state.draft.certifications.filter(item => item.id !== action.id)}};
    case 'toggle-skill': {
      const exists = state.draft.skills.some(item => item.skillId === action.skill.id);
      return {
        ...state,
        draft: {
          ...state.draft,
          skills: exists
            ? state.draft.skills.filter(item => item.skillId !== action.skill.id)
            : [...state.draft.skills, selectedSkill(action.skill)],
        },
      };
    }
    case 'submitting':
      return {...state, submitting: action.value};
    default:
      return state;
  }
}
