import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {ScrollView, StyleSheet, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '../auth/auth-provider';
import {goBackOrReplace} from '../../core/navigation/go-back-or-replace';
import {ActionOverlayModal, type ActionOverlay} from '../../shared/components/ActionOverlayModal';
import {withMinimumDelay} from '../../shared/utils/with-minimum-delay';
import {OnboardingHero} from './components/OnboardingHero';
import {OnboardingProgress} from './components/OnboardingProgress';
import {PersonalDataStep} from './components/PersonalDataStep';
import {WorkExperienceStep} from './components/WorkExperienceStep';
import {useOnboarding} from './hooks/use-onboarding';
import {mapCurrentOnboarding} from './onboarding.mapper';
import {onboardingReducer} from './onboarding.reducer';
import {firstValidationMessage, validatePersonalStep, validateWorkStep} from './onboarding.schemas';
import {createEmptyOnboardingDraft, type MasterOption, type OnboardingActionFeedback, type RunOnboardingAction} from './onboarding.types';

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
    if (currentData) {
      dispatch({type: 'hydrate', draft: mapCurrentOnboarding(currentData, user?.full_name ?? '')});
    }
  }, [currentData, currentLoading, user?.full_name]);

  const majors = useMemo(() => normalizeMasterOptions(onboarding.majors.data), [onboarding.majors.data]);
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
        setOverlay({
          kind: 'error',
          title: feedback.errorTitle ?? 'Gagal Menyimpan',
          message: error instanceof Error ? error.message : 'Data belum dapat disimpan. Silakan coba lagi.',
        });
      }
    })();
  }, []);
  const closeOverlay = () => {
    const nextAction = pendingAction;
    setOverlay(null);
    setPendingAction(null);
    if (nextAction === 'step-2') {
      dispatch({type: 'set-step', step: 2});
    } else if (nextAction === 'home') {
      void (async () => {
        try {
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
  };
  const goBack = () => {
    if (state.step === 2) dispatch({type: 'set-step', step: 1});
    else goBackOrReplace('/');
  };
  const continueToWork = () => {
    const result = validatePersonalStep(state.draft);
    if (!result.success) {
      notify('error', 'Data Belum Lengkap', firstValidationMessage(result.error));
      return;
    }
    setPendingAction('step-2');
    runAction({
      loadingMessage: 'Memeriksa data diri...',
      successTitle: 'Data Diri Lengkap!',
      successMessage: 'Informasi pribadi berhasil divalidasi. Lanjutkan dengan pengalaman kerja.',
    }, () => undefined);
  };
  const finish = () => {
    const result = validateWorkStep(state.draft);
    if (!result.success) {
      notify('error', 'Data Belum Lengkap', firstValidationMessage(result.error));
      return;
    }
    setPendingAction('home');
    runAction({
      loadingMessage: 'Menyelesaikan onboarding...',
      successTitle: 'Onboarding Berhasil!',
      successMessage: 'Profil Anda berhasil dilengkapi. Anda akan dialihkan ke halaman utama.',
      errorTitle: 'Gagal Menyimpan',
    }, async () => {
      dispatch({type: 'submitting', value: true});
      try {
        await onboarding.submit(state.draft);
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
              />
            ) : (
              <WorkExperienceStep draft={state.draft} dispatch={dispatch} skills={onboarding.skills.data ?? []} submitting={state.submitting || onboarding.submitting || overlay?.kind === 'loading'} onBack={() => dispatch({type: 'set-step', step: 1})} onFinish={finish} runAction={runAction} onNotify={notify} />
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
