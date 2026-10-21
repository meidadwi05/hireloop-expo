import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {ScrollView, StyleSheet, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '../auth/auth-provider';
import {OnboardingHero} from './components/OnboardingHero';
import {OnboardingProgress} from './components/OnboardingProgress';
import {OnboardingResultModal} from './components/OnboardingResultModal';
import {PersonalDataStep} from './components/PersonalDataStep';
import {WorkExperienceStep} from './components/WorkExperienceStep';
import {useOnboarding} from './hooks/use-onboarding';
import {mapCurrentOnboarding} from './onboarding.mapper';
import {onboardingReducer} from './onboarding.reducer';
import {firstValidationMessage, validatePersonalStep, validateWorkStep} from './onboarding.schemas';
import {createEmptyOnboardingDraft, type MasterOption, type OnboardingResult} from './onboarding.types';

function normalizeMasterOptions(input: unknown): MasterOption[] {
  const root = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const source = Array.isArray(input) ? input : Array.isArray(root.data) ? root.data : [];
  return source.map(item => {
    const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    const label = String(record.name ?? record.label ?? '');
    return {value: label, label};
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
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [state, dispatch] = useReducer(onboardingReducer, {
    step: 1,
    draft: createEmptyOnboardingDraft(user?.full_name ?? ''),
    submitting: false,
    result: null,
  });

  useEffect(() => {
    if (hydrated.current || currentLoading) return;
    hydrated.current = true;
    if (currentData) {
      dispatch({type: 'hydrate', draft: mapCurrentOnboarding(currentData, user?.full_name ?? '')});
    }
  }, [currentData, currentLoading, user?.full_name]);

  const majors = useMemo(() => normalizeMasterOptions(onboarding.majors.data), [onboarding.majors.data]);
  const notify = (status: OnboardingResult['status'], title: string, message: string) => {
    setPendingAction(null);
    dispatch({type: 'set-result', result: {status, title, message}});
  };
  const closeResult = () => {
    dispatch({type: 'set-result', result: null});
    if (pendingAction === 'step-2') {
      dispatch({type: 'set-step', step: 2});
      setPendingAction(null);
    } else if (pendingAction === 'home') {
      setPendingAction(null);
      router.replace('/(candidate)/(tabs)/home');
    }
  };
  const goBack = () => {
    if (state.step === 2) dispatch({type: 'set-step', step: 1});
    else router.back();
  };
  const continueToWork = () => {
    const result = validatePersonalStep(state.draft);
    if (!result.success) {
      notify('error', 'Data Belum Lengkap', firstValidationMessage(result.error));
      return;
    }
    setPendingAction('step-2');
    dispatch({type: 'set-result', result: {status: 'success', title: 'Data Diri Lengkap!', message: 'Informasi pribadi berhasil divalidasi. Lanjutkan dengan pengalaman kerja.'}});
  };
  const finish = async () => {
    const result = validateWorkStep(state.draft);
    if (!result.success) {
      notify('error', 'Data Belum Lengkap', firstValidationMessage(result.error));
      return;
    }
    dispatch({type: 'submitting', value: true});
    try {
      await onboarding.submit(state.draft);
      setPendingAction('home');
      dispatch({type: 'set-result', result: {status: 'success', title: 'Onboarding Berhasil!', message: 'Profil Anda berhasil dilengkapi. Anda akan dialihkan ke halaman utama.'}});
    } catch (error) {
      notify('error', 'Gagal Menyimpan', error instanceof Error ? error.message : 'Data onboarding belum dapat disimpan. Silakan coba lagi.');
    } finally {
      dispatch({type: 'submitting', value: false});
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.page, width > 720 && styles.desktopPage]}>
          <OnboardingHero step={state.step} onBack={goBack} />
          <OnboardingProgress step={state.step} />
          <View style={styles.formWrap}>
            {state.step === 1 ? (
              <PersonalDataStep draft={state.draft} dispatch={dispatch} majorOptions={majors} onNext={continueToWork} onNotify={notify} />
            ) : (
              <WorkExperienceStep draft={state.draft} dispatch={dispatch} skills={onboarding.skills.data ?? []} submitting={state.submitting || onboarding.submitting} onBack={() => dispatch({type: 'set-step', step: 1})} onFinish={finish} onNotify={notify} />
            )}
          </View>
        </View>
      </ScrollView>
      <OnboardingResultModal result={state.result} onClose={closeResult} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#010934'},
  scrollContent: {flexGrow: 1, backgroundColor: '#010934', paddingBottom: 76},
  page: {width: '100%', maxWidth: 720, alignSelf: 'center'},
  desktopPage: {marginTop: 20, borderRadius: 28, overflow: 'hidden'},
  formWrap: {paddingHorizontal: 24, paddingBottom: 30},
});
