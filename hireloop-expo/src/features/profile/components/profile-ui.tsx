import Ionicons from '@expo/vector-icons/Ionicons';
import React, {type PropsWithChildren} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';

export const profileColors = {
  background: '#F5F8FC',
  navy: '#06264F',
  blue: '#0865FF',
  blueDark: '#0345AE',
  ink: '#111827',
  muted: '#667085',
  border: '#E3E9F2',
  card: '#FFFFFF',
  green: '#00B979',
  red: '#E43D4F',
};

export const profileFonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

type HeaderProps = {
  title: string;
  rightLabel?: string;
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onRightPress?: () => void;
  fallback?: Parameters<typeof goBackOrReplace>[0];
};

export function ProfileHeader({
  title,
  rightLabel,
  rightIcon,
  onRightPress,
  fallback = '/(candidate)/(tabs)/profile',
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, {paddingTop: insets.top}]}>
      <View style={styles.headerBar}>
        <Pressable
          accessibilityLabel="Kembali"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => goBackOrReplace(fallback)}
          style={styles.headerAction}
        >
          <Ionicons name="arrow-back" size={25} color="white" />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
        {onRightPress ? (
          <Pressable
            accessibilityLabel={rightLabel ?? 'Aksi halaman'}
            accessibilityRole="button"
            hitSlop={6}
            onPress={onRightPress}
            style={[styles.headerAction, styles.headerRight]}
          >
            {rightIcon ? <Ionicons name={rightIcon} size={22} color="white" /> : null}
            {rightLabel ? <Text style={styles.headerLabel}>{rightLabel}</Text> : null}
          </Pressable>
        ) : <View style={styles.headerAction} />}
      </View>
    </View>
  );
}

export function ProfilePage({children, contentContainerStyle, ...props}: PropsWithChildren<ScrollViewProps>) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      {...props}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.pageContent, {paddingBottom: Math.max(28, insets.bottom + 20)}, contentContainerStyle]}
      style={styles.page}
    >
      {children}
    </ScrollView>
  );
}

export function ProfileCard({children, style}: PropsWithChildren<{style?: object}>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardTitle({icon, title, action, onAction}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.cardTitleRow}>
      <Ionicons name={icon} size={22} color={profileColors.blue} />
      <Text style={styles.cardTitle}>{title}</Text>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text style={styles.cardAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function DataRow({label, value, icon, last = false, right}: {
  label: string;
  value: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  last?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View style={[styles.dataRow, last && styles.dataRowLast]}>
      <Text style={styles.dataLabel}>{label}</Text>
      <View style={styles.dataValueWrap}>
        <Text selectable numberOfLines={3} style={styles.dataValue}>{value || 'Belum dilengkapi'}</Text>
        {icon ? <Ionicons name={icon} size={19} color={profileColors.blue} /> : null}
        {right}
      </View>
    </View>
  );
}

export function ScreenState({loading, error, empty, onRetry}: {
  loading?: boolean;
  error?: string;
  empty?: string;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={profileColors.blue} />
        <Text style={styles.stateText}>Memuat data profil...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.state}>
        <Ionicons name="cloud-offline-outline" size={36} color="#9A6500" />
        <Text style={styles.stateTitle}>Data belum dapat dimuat</Text>
        <Text style={styles.stateText}>{error}</Text>
        {onRetry ? <Pressable style={styles.retry} onPress={onRetry}><Text style={styles.retryText}>Coba lagi</Text></Pressable> : null}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.state}>
        <Ionicons name="folder-open-outline" size={38} color="#98A2B3" />
        <Text style={styles.stateText}>{empty}</Text>
      </View>
    );
  }
  return null;
}

export function PrimaryButton({label, icon, onPress, disabled = false}: {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [styles.primaryButton, disabled && styles.buttonDisabled, pressed && !disabled && styles.buttonPressed]}
    >
      {icon ? <Ionicons name={icon} size={20} color="white" /> : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {flex: 1, backgroundColor: profileColors.background},
  pageContent: {padding: 16, gap: 14},
  header: {backgroundColor: profileColors.navy},
  headerBar: {height: 62, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12},
  headerAction: {width: 46, minHeight: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5},
  headerRight: {width: 'auto', minWidth: 46, paddingHorizontal: 4},
  headerTitle: {flex: 1, color: 'white', fontFamily: profileFonts.bold, fontSize: 19, marginLeft: 8},
  headerLabel: {fontFamily: profileFonts.semibold, fontSize: 12, color: 'white'},
  card: {
    backgroundColor: profileColors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF1F6',
    padding: 16,
    shadowColor: '#18345F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: profileColors.border},
  cardTitle: {flex: 1, fontFamily: profileFonts.bold, fontSize: 15, color: profileColors.ink},
  cardAction: {fontFamily: profileFonts.semibold, fontSize: 12, color: profileColors.blue},
  dataRow: {minHeight: 49, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: 1, borderBottomColor: profileColors.border, paddingVertical: 9},
  dataRowLast: {borderBottomWidth: 0, paddingBottom: 0},
  dataLabel: {width: '36%', fontFamily: profileFonts.regular, fontSize: 12, lineHeight: 17, color: profileColors.muted},
  dataValueWrap: {flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8},
  dataValue: {flex: 1, fontFamily: profileFonts.medium, fontSize: 12, lineHeight: 18, color: profileColors.ink, textAlign: 'left'},
  state: {minHeight: 260, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 9},
  stateTitle: {fontFamily: profileFonts.bold, fontSize: 16, color: profileColors.ink, textAlign: 'center'},
  stateText: {fontFamily: profileFonts.regular, fontSize: 12, lineHeight: 18, color: profileColors.muted, textAlign: 'center'},
  retry: {marginTop: 7, minHeight: 42, paddingHorizontal: 20, borderRadius: 10, backgroundColor: profileColors.blue, alignItems: 'center', justifyContent: 'center'},
  retryText: {fontFamily: profileFonts.semibold, fontSize: 12, color: 'white'},
  primaryButton: {minHeight: 49, borderRadius: 11, backgroundColor: profileColors.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 18},
  primaryButtonText: {fontFamily: profileFonts.bold, fontSize: 13, color: 'white'},
  buttonPressed: {opacity: 0.8},
  buttonDisabled: {opacity: 0.5},
});
