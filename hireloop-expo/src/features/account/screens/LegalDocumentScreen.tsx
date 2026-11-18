import {useQuery} from '@tanstack/react-query';
import {router} from 'expo-router';
import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View, useWindowDimensions} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {ProfileHeader, ProfilePage, ScreenState, profileFonts} from '../../profile/components/profile-ui';
import {legalApi, type LegalDocumentKind} from '../api/legal.api';

const metadata = {
  privacy: {title: 'Kebijakan Privasi', route: '/(candidate)/account/privacy-policy'},
  terms: {title: 'Syarat & Ketentuan', route: '/(candidate)/account/terms-and-conditions'},
};

function isContactSection(title: string): boolean {
  const normalized = title.toLowerCase();
  return normalized.includes('hubungi kami') || normalized.includes('kontak');
}

function splitContactItem(item: string): {label: string; value: string} {
  const [label, ...valueParts] = item.split(':');
  const normalizedLabel = label.trim();
  return {label: normalizedLabel, value: valueParts.join(':').trim() || normalizedLabel};
}

export function LegalDocumentScreen({kind}: {kind: LegalDocumentKind}) {
  const document = metadata[kind];
  const {width} = useWindowDimensions();
  const wide = width >= 600;
  const query = useQuery({
    queryKey: ['legal-document', kind],
    queryFn: () => legalApi.getDocument(kind),
    staleTime: 30 * 60 * 1000,
  });
  const entries = query.data ?? [];
  const header = useMemo(() => entries.find(entry => entry.structure.toLowerCase() === 'header') ?? entries[0], [entries]);
  const sections = useMemo(() => entries.filter(entry => entry.id !== header?.id), [entries, header?.id]);
  const error = query.isError ? toAppApiError(query.error).message : null;
  const selectDocument = (nextKind: LegalDocumentKind) => {
    if (nextKind === kind) return;
    router.replace(metadata[nextKind].route as never);
  };

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Informasi HireLoop" fallback="/profile" />
      {query.isLoading || error || !header ? (
        <ScreenState
          loading={query.isLoading}
          error={error ?? (!query.isLoading && !header ? 'Dokumen legal belum tersedia.' : undefined)}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <ProfilePage contentContainerStyle={[styles.pageContent, wide && styles.pageContentWide]}>
          <View style={styles.navigation}>
            <Text style={styles.navigationLabel}>INFORMASI HIRELOOP</Text>
            <View accessibilityRole="tablist" style={styles.navigationItems}>
              {(['terms', 'privacy'] as const).map(itemKind => {
                const active = itemKind === kind;
                return (
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{selected: active}}
                    key={itemKind}
                    onPress={() => selectDocument(itemKind)}
                    style={({pressed}) => [
                      styles.navigationItem,
                      active && styles.navigationItemActive,
                      pressed && !active && styles.navigationItemPressed,
                    ]}
                  >
                    <Text style={[styles.navigationText, active && styles.navigationTextActive]}>
                      {metadata[itemKind].title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.document, wide && styles.documentWide]}>
            <Text selectable style={styles.title}>{header.title || document.title}</Text>
            {header.content[0] ? <Text selectable style={styles.version}>{header.content[0]}</Text> : null}
            {header.description ? <Text selectable style={styles.intro}>{header.description}</Text> : null}

            {sections.map(section => {
              const contact = isContactSection(section.title);
              return (
                <View key={section.id} style={styles.section}>
                  <Text selectable style={styles.sectionTitle}>{section.title}</Text>
                  {section.description ? <Text selectable style={styles.content}>{section.description}</Text> : null}
                  {section.content.length && contact ? (
                    <View style={styles.contactCard}>
                      {section.content.map((item, itemIndex) => {
                        const contactItem = splitContactItem(item);
                        return (
                          <View key={`${section.id}-${itemIndex}`} style={styles.contactRow}>
                            <Text selectable style={styles.contactLabel}>{contactItem.label}</Text>
                            <Text selectable style={styles.contactValue}>{contactItem.value}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : section.content.length ? (
                    <View style={styles.bullets}>
                      {section.content.map((item, itemIndex) => (
                        <View key={`${section.id}-${itemIndex}`} style={styles.bulletRow}>
                          <Text style={styles.bullet}>•</Text>
                          <Text selectable style={styles.bulletText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 HireLoop · PT Proven Force Indonesia</Text>
          </View>
        </ProfilePage>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: '#F8FAFC'},
  pageContent: {gap: 16, padding: 16},
  pageContentWide: {paddingHorizontal: 24, paddingTop: 24},
  navigation: {gap: 10},
  navigationLabel: {fontFamily: profileFonts.bold, fontSize: 10, letterSpacing: 0.8, color: '#94A3B8', paddingLeft: 4},
  navigationItems: {flexDirection: 'row', gap: 8},
  navigationItem: {flex: 1, minHeight: 42, borderRadius: 9, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10},
  navigationItemActive: {borderColor: '#BAE6FD', borderLeftColor: '#0284C7', borderLeftWidth: 3, backgroundColor: '#F0F9FF'},
  navigationItemPressed: {backgroundColor: '#F1F5F9'},
  navigationText: {fontFamily: profileFonts.medium, fontSize: 11.5, color: '#475569', textAlign: 'center'},
  navigationTextActive: {fontFamily: profileFonts.semibold, color: '#0284C7'},
  document: {backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 24, shadowColor: '#000000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1},
  documentWide: {padding: 32},
  title: {fontFamily: profileFonts.bold, fontSize: 24, lineHeight: 31, letterSpacing: -0.35, color: '#00205A'},
  version: {fontFamily: profileFonts.medium, fontSize: 10.5, lineHeight: 15, color: '#94A3B8', marginTop: 6},
  intro: {fontFamily: profileFonts.regular, fontSize: 12, lineHeight: 20, color: '#334155', marginTop: 22},
  section: {marginTop: 28},
  sectionTitle: {fontFamily: profileFonts.bold, fontSize: 15, lineHeight: 21, color: '#00205A'},
  content: {fontFamily: profileFonts.regular, fontSize: 12, lineHeight: 20, color: '#334155', marginTop: 9},
  bullets: {gap: 9, marginTop: 11},
  bulletRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingRight: 2},
  bullet: {fontFamily: profileFonts.bold, fontSize: 12, lineHeight: 20, color: '#64748B'},
  bulletText: {flex: 1, fontFamily: profileFonts.regular, fontSize: 11.5, lineHeight: 20, color: '#334155'},
  contactCard: {gap: 14, marginTop: 13, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: '#F8FAFC', paddingHorizontal: 18, paddingVertical: 17},
  contactRow: {gap: 3},
  contactLabel: {fontFamily: profileFonts.bold, fontSize: 9.5, lineHeight: 14, letterSpacing: 0.45, color: '#64748B', textTransform: 'uppercase'},
  contactValue: {fontFamily: profileFonts.medium, fontSize: 11.5, lineHeight: 18, color: '#0F172A'},
  footer: {alignItems: 'center', borderRadius: 12, backgroundColor: '#0B1528', paddingHorizontal: 18, paddingVertical: 16},
  footerText: {fontFamily: profileFonts.regular, fontSize: 10.5, lineHeight: 16, color: '#94A3B8', textAlign: 'center'},
});
