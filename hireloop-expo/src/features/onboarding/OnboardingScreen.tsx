import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {ScrollView, StyleSheet, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '../auth/auth-provider';
import {clearRegisterContactDraft, loadRegisterContactDraft} from '../auth/register-draft.storage';
import {goBackOrReplace} from '../../core/navigation/go-back-or-replace';
import {ActionOverlayModal, type ActionOverlay} from '../../shared/components/ActionOverlayModal';
import {withMinimumDelay} from '../../shared/utils/with-minimum-delay';
import {OnboardingHero} from './components/OnboardingHero';
import {OnboardingProgress} from './components/OnboardingProgress';
import {PersonalDataStep} from './components/PersonalDataStep';
import {WorkExperienceStep} from './components/WorkExperienceStep';
import {useOnboarding} from './hooks/use-onboarding';
import {isProductionOnboarding, mapCurrentOnboarding} from './onboarding.mapper';
import {onboardingReducer} from './onboarding.reducer';
import {firstValidationMessage, validatePersonalStep, validateWorkStep} from './onboarding.schemas';
import {createEmptyOnboardingDraft, type MasterOption, type OnboardingActionFeedback, type RunOnboardingAction} from './onboarding.types';
import {clearOnboardingDraft, loadOnboardingDraft, saveOnboardingDraft} from './onboarding.storage';

function normalizeMasterOptions(input: unknown): MasterOption[] {
  const root = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const source = Array.isArray(input) ? input : Array.isArray(root.data) ? root.data : [];
  return source.map(item => {
    const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    const label = String(record.name ?? record.label ?? '');
    const id = Number(record.id);
    return {value: Number.isFinite(id) ? String(id) : label, label};
  }).filter(option => option.value);
}

type PendingAction = 'step-2' | 'home' | null;

const backendFieldMap: Record<string, string> = {
  nik: 'nik',
  full_name: 'fullName',
  nama_lengkap: 'fullName',
  gender: 'gender',
  jenis_kelamin: 'gender',
  birth_place: 'birthPlace',
  tempat_lahir: 'birthPlace',
  birth_date: 'birthDate',
  tanggal_lahir: 'birthDate',
  marital_status: 'maritalStatus',
  status_pernikahan: 'maritalStatus',
  phone: 'phone',
  nomor_handphone: 'phone',
  ktp_address: 'identityAddress',
  alamat_ktp: 'identityAddress',
  ktp_address_detail: 'identityAddress',
  address: 'domicileAddress',
  alamat_domisili: 'domicileAddress',
  domicile_address_detail: 'domicileAddress',
  education_level: 'educations',
  pendidikan_terakhir: 'educations',
  educations: 'educations',
  pengalaman_kerja: 'experiences',
  skills: 'skills',
};

function backendErrors(error: unknown): Record<string, string> {
  if (!error || typeof error !== 'object') return {};
  const validation = (error as {validationErrors?: Record<string, string[]>}).validationErrors ?? {};
  const mapped: Record<string, string> = {};
  Object.entries(validation).forEach(([path, messages]) => {
    const root = path.split('.')[0];
    const field = backendFieldMap[root] ?? root;
    mapped[field] ??= messages[0] ?? 'Periksa kembali nilai ini.';
  });
  return mapped;
}

function actionErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && typeof (error as {message?: unknown}).message === 'string') return (error as {message: string}).message;
  return 'Data belum dapat disimpan. Silakan coba lagi.';
}

export function OnboardingScreen() {
  const {width} = useWindowDimensions();
  const {user, refreshUser} = useAuth();
  const onboarding = useOnboarding(refreshUser);
  const currentData = onboarding.current.data;
  const currentLoading = onboarding.current.isLoading;
  const hydrated = useRef(false);
  const mounted = useRef(true);
  const actionId = useRef(0);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [overlay, setOverlay] = useState<ActionOverlay | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [state, dispatch] = useReducer(onboardingReducer, {
    step: 1,
    draft: createEmptyOnboardingDraft(user?.full_name ?? ''),
    submitting: false,
  });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      actionId.current += 1;
    };
  }, []);

  useEffect(() => {
    if (hydrated.current || currentLoading) return;
    hydrated.current = true;
    void (async () => {
      const localDraft = user?.id ? await loadOnboardingDraft(user.id) : null;
      if (!mounted.current) return;
      if (localDraft) {
        dispatch({type: 'hydrate', draft: {...localDraft.draft, email: localDraft.draft.email || user?.email || ''}});
        dispatch({type: 'set-step', step: localDraft.step});
      } else if (currentData) {
        const serverDraft = mapCurrentOnboarding(currentData, user?.full_name ?? '');
        const registerDraft = user?.email ? await loadRegisterContactDraft(user.email) : null;
        dispatch({type: 'hydrate', draft: {...serverDraft, email: serverDraft.email || user?.email || '', phone: serverDraft.phone || registerDraft?.phone || ''}});
      } else if (user?.email) {
        const registerDraft = await loadRegisterContactDraft(user.email);
        dispatch({type: 'hydrate', draft: {...createEmptyOnboardingDraft(user.full_name), email: user.email, phone: registerDraft?.phone || ''}});
      }
      setDraftReady(true);
    })();
  }, [currentData, currentLoading, user?.email, user?.full_name, user?.id]);

  useEffect(() => {
    if (!draftReady || !user?.id) return;
    const timer = setTimeout(() => {
      void saveOnboardingDraft(user.id, state.step, state.draft);
    }, 350);
    return () => clearTimeout(timer);
  }, [draftReady, state.draft, state.step, user?.id]);

  const majors = useMemo(() => normalizeMasterOptions(onboarding.majors.data), [onboarding.majors.data]);
  const production = useMemo(() => Boolean(user?.prod_candidate || isProductionOnboarding(currentData)), [currentData, user?.prod_candidate]);
  const notify = useCallback((status: 'success' | 'error', title: string, message: string) => {
    setPendingAction(null);
    setOverlay({kind: status, title, message});
  }, []);
  const runAction = useCallback<RunOnboardingAction>((feedback: OnboardingActionFeedback, operation) => {
    const currentActionId = ++actionId.current;
    setOverlay({kind: 'loading', message: feedback.loadingMessage});
    void (async () => {
      try {
        await withMinimumDelay(operation, feedback.minimumDuration);
        if (!mounted.current || currentActionId !== actionId.current) return;
        setOverlay({kind: 'success', title: feedback.successTitle, message: feedback.successMessage});
      } catch (error) {
        if (!mounted.current || currentActionId !== actionId.current) return;
        setPendingAction(null);
        const nextErrors = backendErrors(error);
        if (Object.keys(nextErrors).length) setFormErrors(current => ({...current, ...nextErrors}));
        setOverlay({
          kind: 'error',
          title: feedback.errorTitle ?? 'Gagal Menyimpan',
          message: actionErrorMessage(error),
        });
      }
    })();
  }, []);
  const closeOverlay = useCallback(() => {
    const nextAction = pendingAction;
    setOverlay(null);
    setPendingAction(null);
    if (nextAction === 'step-2') {
      dispatch({type: 'set-step', step: 2});
    } else if (nextAction === 'home') {
      void (async () => {
        try {
          if (user?.id) await clearOnboardingDraft(user.id);
          const refreshedUser = await onboarding.refreshAfterSubmit();
          if (!refreshedUser) throw new Error('Profil sudah tersimpan, tetapi sesi belum dapat diperbarui. Silakan masuk kembali.');
          router.replace('/(candidate)/(tabs)/home');
        } catch (error) {
          if (!mounted.current) return;
          setOverlay({
            kind: 'error',
            title: 'Sesi Belum Diperbarui',
            message: error instanceof Error ? error.message : 'Profil sudah tersimpan, tetapi sesi belum dapat diperbarui. Silakan coba masuk kembali.',
          });
        }
      })();
    }
  }, [onboarding, pendingAction, user]);
  useEffect(() => {
    if (overlay?.kind !== 'success') return;
    const timer = setTimeout(closeOverlay, 1400);
    return () => clearTimeout(timer);
  }, [closeOverlay, overlay?.kind]);
  const goBack = () => {
    if (state.step === 2) dispatch({type: 'set-step', step: 1});
    else goBackOrReplace('/');
  };
  const continueToWork = () => {
    const result = validatePersonalStep(state.draft);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => { nextErrors[String(issue.path[0])] ??= issue.message; });
      setFormErrors(nextErrors);
      notify('error', 'Data Belum Lengkap', firstValidationMessage(result.error));
      return;
    }
    setFormErrors({});
    setPendingAction('step-2');
    runAction({
      loadingMessage: 'Menyimpan data diri...',
      successTitle: 'Data Diri Tersimpan!',
      successMessage: 'Informasi pribadi tersimpan. Lanjutkan dengan pengalaman kerja.',
    }, async () => {
      await onboarding.savePersonal(state.draft, production);
      await clearRegisterContactDraft();
    });
  };
  const finish = () => {
    const result = validateWorkStep(state.draft);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => { nextErrors[String(issue.path[0])] ??= issue.message; });
      setFormErrors(nextErrors);
      notify('error', 'Data Belum Lengkap', firstValidationMessage(result.error));
      return;
    }
    setFormErrors({});
    setPendingAction('home');
    runAction({
      loadingMessage: 'Menyelesaikan onboarding...',
      successTitle: 'Onboarding Berhasil!',
      successMessage: 'Profil Anda berhasil dilengkapi. Anda akan dialihkan ke halaman utama.',
      errorTitle: 'Gagal Menyimpan',
    }, async () => {
      dispatch({type: 'submitting', value: true});
      try {
        await onboarding.submit(state.draft, production);
      } finally {
        dispatch({type: 'submitting', value: false});
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.page, width > 720 && styles.desktopPage]}>
          <OnboardingHero step={state.step} onBack={goBack} />
          <OnboardingProgress step={state.step} />
          <View style={[styles.formWrap, width < 390 && styles.formWrapNarrow]}>
            {state.step === 1 ? (
              <PersonalDataStep
                draft={state.draft}
                dispatch={dispatch}
                majorOptions={majors}
                majorLoading={onboarding.majors.isFetching}
                majorError={onboarding.majors.isError}
                onRetryMajors={() => { void onboarding.majors.refetch(); }}
                onNext={continueToWork}
                runAction={runAction}
                errors={formErrors}
              />
            ) : (
              <WorkExperienceStep
                draft={state.draft}
                dispatch={dispatch}
                skills={onboarding.skills.data ?? []}
                experienceOptions={onboarding.experiences.data ?? []}
                experienceLoading={onboarding.experiences.isFetching}
                experienceError={onboarding.experiences.isError}
                onRetryExperiences={() => { void onboarding.experiences.refetch(); }}
                errors={formErrors}
                submitting={state.submitting || onboarding.submitting || overlay?.kind === 'loading'}
                onBack={() => dispatch({type: 'set-step', step: 1})}
                onFinish={finish}
                runAction={runAction}
                onNotify={notify}
              />
            )}
          </View>
        </View>
      </ScrollView>
      {overlay ? <ActionOverlayModal overlay={overlay} onClose={closeOverlay} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#010934'},
  scrollContent: {flexGrow: 1, backgroundColor: '#010934', paddingBottom: 76},
  page: {width: '100%', maxWidth: 720, alignSelf: 'center'},
  desktopPage: {marginTop: 20, borderRadius: 28, overflow: 'hidden'},
  formWrap: {paddingHorizontal: 24, paddingBottom: 30},
  formWrapNarrow: {paddingHorizontal: 14},
});
