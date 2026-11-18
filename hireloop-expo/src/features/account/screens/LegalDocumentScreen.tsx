import Ionicons from '@expo/vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';
import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {ProfileCard, ProfileHeader, ProfilePage, ScreenState, profileColors, profileFonts} from '../../profile/components/profile-ui';
import {legalApi, type LegalDocumentKind} from '../api/legal.api';

const metadata = {
  privacy: {title: 'Kebijakan Privasi', icon: 'shield-checkmark-outline' as const},
  terms: {title: 'Syarat & Ketentuan', icon: 'document-text-outline' as const},
};

export function LegalDocumentScreen({kind}: {kind: LegalDocumentKind}) {
  const document = metadata[kind];
  const query = useQuery({
    queryKey: ['legal-document', kind],
    queryFn: () => legalApi.getDocument(kind),
    staleTime: 30 * 60 * 1000,
  });
  const entries = query.data ?? [];
  const header = useMemo(() => entries.find(entry => entry.structure.toLowerCase() === 'header') ?? entries[0], [entries]);
  const sections = useMemo(() => entries.filter(entry => entry.id !== header?.id), [entries, header?.id]);
  const error = query.isError ? toAppApiError(query.error).message : null;

  return (
    <View style={styles.screen}>
      <ProfileHeader title={document.title} fallback="/profile" />
      {query.isLoading || error || !header ? (
        <ScreenState
          loading={query.isLoading}
          error={error ?? (!query.isLoading && !header ? 'Dokumen legal belum tersedia.' : undefined)}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <ProfilePage>
          <ProfileCard>
            <View style={styles.hero}>
              <View style={styles.icon}><Ionicons name={document.icon} size={27} color={profileColors.blue} /></View>
              <View style={styles.heroCopy}>
                <Text style={styles.title}>{header.title || document.title}</Text>
                {header.content[0] ? <Text style={styles.version}>{header.content[0]}</Text> : null}
              </View>
            </View>
            {header.description ? <Text selectable style={styles.intro}>{header.description}</Text> : null}
          </ProfileCard>

          {sections.map((section, index) => (
            <ProfileCard key={section.id}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              {section.description ? <Text selectable style={styles.content}>{section.description}</Text> : null}
              {section.content.length ? (
                <View style={styles.bullets}>
                  {section.content.map((item, itemIndex) => (
                    <View key={`${section.id}-${itemIndex}`} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text selectable style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </ProfileCard>
          ))}
        </ProfilePage>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: profileColors.background},
  hero: {flexDirection: 'row', alignItems: 'center', gap: 12},
  icon: {width: 52, height: 52, borderRadius: 14, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center'},
  heroCopy: {flex: 1, minWidth: 0},
  title: {fontFamily: profileFonts.bold, fontSize: 17, color: profileColors.ink},
  version: {fontFamily: profileFonts.regular, fontSize: 9.5, lineHeight: 14, color: profileColors.muted, marginTop: 3},
  intro: {fontFamily: profileFonts.regular, fontSize: 11.5, lineHeight: 19, color: '#344054', marginTop: 14},
  sectionTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  number: {width: 30, height: 30, borderRadius: 9, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center'},
  numberText: {fontFamily: profileFonts.bold, fontSize: 11, color: profileColors.blue},
  sectionTitle: {flex: 1, fontFamily: profileFonts.bold, fontSize: 14, lineHeight: 20, color: profileColors.ink},
  content: {fontFamily: profileFonts.regular, fontSize: 11.5, lineHeight: 19, color: '#475467', marginTop: 12},
  bullets: {gap: 9, marginTop: 12},
  bulletRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  bullet: {fontFamily: profileFonts.bold, fontSize: 13, lineHeight: 19, color: profileColors.blue},
  bulletText: {flex: 1, fontFamily: profileFonts.regular, fontSize: 11.5, lineHeight: 19, color: '#475467'},
});
