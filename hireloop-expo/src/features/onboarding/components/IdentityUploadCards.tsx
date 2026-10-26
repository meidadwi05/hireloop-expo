import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';

const COLORS = {
  blue: '#087BFF',
  cyan: '#00D8F4',
  card: '#061D52',
  cardInner: '#08265F',
  muted: '#B7C2D9',
  white: '#FFFFFF',
} as const;

function StaticAction({icon, label, primary}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  primary?: boolean;
}) {
  return (
    <View
      accessibilityLabel={`${label}, belum tersedia`}
      style={[styles.action, primary ? styles.actionPrimary : styles.actionOutline]}
    >
      <Ionicons name={icon} size={17} color={COLORS.white} />
      <Text style={styles.actionText}>{label}</Text>
    </View>
  );
}

export function IdentityUploadCards() {
  const {width} = useWindowDimensions();
  const compact = width < 390;

  return (
    <View testID="identity-upload-cards" style={styles.stack}>
      <View testID="ktp-upload-card" style={[styles.card, compact && styles.cardCompact]}>
        <View style={styles.header}>
          <View style={styles.headerIcon}><Ionicons name="document-text-outline" size={19} color={COLORS.white} /></View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Upload KTP</Text>
            <Text style={styles.subtitle}>Isi data diri otomatis dari foto KTP</Text>
          </View>
        </View>

        <View style={styles.dropZone}>
          <View style={styles.identityIcon}>
            <Ionicons name="card-outline" size={43} color="#8DBBFF" />
          </View>
          <Text style={styles.dropTitle}>Unggah atau ambil foto KTP Anda</Text>
          <Text style={styles.dropMeta}>Format JPG, PNG, maksimal 5 MB</Text>
        </View>

        <View style={styles.ktpActions}>
          <StaticAction icon="camera-outline" label="Ambil Foto KTP" primary />
          <StaticAction icon="cloud-upload-outline" label="Unggah Foto" />
        </View>
      </View>

      <View testID="profile-photo-card" style={[styles.card, compact && styles.cardCompact]}>
        <View style={styles.header}>
          <View style={styles.headerIcon}><Ionicons name="person" size={18} color={COLORS.white} /></View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Foto Profil</Text>
            <Text style={styles.subtitle}>Foto profil akan digunakan pada profil Anda</Text>
          </View>
        </View>

        <View style={styles.avatar}>
          <Ionicons name="person" size={54} color="#AAB8D1" />
        </View>

        <View style={[styles.profileActions, compact && styles.profileActionsCompact]}>
          <View style={styles.profileAction}><StaticAction icon="camera-outline" label="Ambil Foto" primary /></View>
          <View style={styles.profileAction}><StaticAction icon="image-outline" label="Pilih dari Galeri" /></View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {width: '100%', maxWidth: 620, alignSelf: 'center', gap: 16},
  card: {width: '100%', backgroundColor: COLORS.card, borderRadius: 24, padding: 18},
  cardCompact: {borderRadius: 20, padding: 14},
  header: {flexDirection: 'row', alignItems: 'center', gap: 11},
  headerIcon: {width: 34, height: 34, borderRadius: 10, backgroundColor: '#1766D8', alignItems: 'center', justifyContent: 'center'},
  headerCopy: {flex: 1, minWidth: 0},
  title: {fontFamily: 'PlusJakartaSans_600SemiBold', color: COLORS.white, fontSize: 15, lineHeight: 21},
  subtitle: {fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.muted, fontSize: 10, lineHeight: 15},
  dropZone: {minHeight: 152, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#2F7FFF', borderRadius: 12, marginTop: 16, alignItems: 'center', justifyContent: 'center', padding: 16},
  identityIcon: {width: 72, height: 54, borderRadius: 9, backgroundColor: '#D6E5FF', alignItems: 'center', justifyContent: 'center', marginBottom: 10},
  dropTitle: {fontFamily: 'PlusJakartaSans_500Medium', color: COLORS.white, fontSize: 11, lineHeight: 17, textAlign: 'center'},
  dropMeta: {fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.muted, fontSize: 9, lineHeight: 14, textAlign: 'center'},
  ktpActions: {gap: 9, marginTop: 10},
  action: {minHeight: 44, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12},
  actionPrimary: {backgroundColor: COLORS.blue, borderWidth: 1, borderColor: COLORS.cyan},
  actionOutline: {backgroundColor: COLORS.cardInner, borderWidth: 1.5, borderColor: '#2F7FFF'},
  actionText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: COLORS.white, fontSize: 11},
  avatar: {width: 96, height: 96, borderRadius: 48, alignSelf: 'center', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginVertical: 17},
  profileActions: {flexDirection: 'row', gap: 10},
  profileActionsCompact: {flexDirection: 'column'},
  profileAction: {flex: 1, minWidth: 0},
});
