import {Ionicons} from '@expo/vector-icons';
import React, {useMemo, useState} from 'react';
import {FlatList, Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {FormFieldPressable} from '../../../components/forms/FormFieldPressable';
import {FormTextInput} from '../../../components/forms/FormTextInput';
import type {SelectedSkill, SkillOption} from '../onboarding.types';
import {FieldLabel} from './FormControls';

export function SkillMultiSelect({options, selected, onToggle, onToggleCustom, error}: {
  options: SkillOption[];
  selected: SelectedSkill[];
  onToggle: (skill: SkillOption) => void;
  onToggleCustom: (name: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const canAddCustom = query.trim().length >= 2
    && !options.some(option => option.name.toLowerCase() === normalizedQuery)
    && !selected.some(skill => skill.name.toLowerCase() === normalizedQuery);
  const filtered = useMemo(() => options.filter(option => (
    !selected.some(skill => skill.skillId === option.id)
    && option.name.toLowerCase().includes(normalizedQuery)
  )).slice(0, 100), [options, normalizedQuery, selected]);
  return (
    <View style={styles.group}>
      <FieldLabel label="Keahlian" required />
      <FormFieldPressable
        accessibilityRole="button"
        accessibilityLabel="Pilih keahlian"
        containerStyle={styles.control}
        error={Boolean(error)}
        errorContainerStyle={styles.controlError}
        onPress={() => setOpen(true)}
      >
        <View style={styles.chips}>
          {selected.length ? selected.map(skill => (
            <View key={`${skill.skillId}-${skill.name}`} style={styles.chip}>
              <Text style={styles.chipText}>{skill.name}</Text>
              <Pressable accessibilityLabel={`Hapus ${skill.name}`} onPress={() => skill.skillId === null ? onToggleCustom(skill.name) : onToggle({id: skill.skillId, name: skill.name})} hitSlop={8}><Ionicons name="close" size={14} color="#4C8CFF" /></Pressable>
            </View>
          )) : <Text style={styles.placeholder}>Cari keahlian</Text>}
        </View>
        <Ionicons name="chevron-down" size={19} color="#172036" />
      </FormFieldPressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}><Text style={styles.title}>Pilih Keahlian</Text><Pressable onPress={() => setOpen(false)}><Ionicons name="close" size={25} /></Pressable></View>
            <FormTextInput
              accessibilityLabel="Cari keahlian"
              autoFocus
              containerStyle={styles.searchFrame}
              inputStyle={styles.search}
              onChangeText={setQuery}
              placeholder="Cari keahlian"
              value={query}
            />
            <FlatList
              data={filtered}
              keyExtractor={item => String(item.id)}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={canAddCustom ? (
                <Pressable accessibilityRole="button" onPress={() => { onToggleCustom(query); setQuery(''); }} style={styles.customOption}>
                  <Ionicons name="add-circle-outline" size={21} color="#087BFF" />
                  <View style={styles.customCopy}><Text style={styles.customTitle}>Tambahkan keahlian sendiri</Text><Text numberOfLines={1} style={styles.customName}>{query.trim()}</Text></View>
                </Pressable>
              ) : null}
              ListEmptyComponent={<Text style={styles.empty}>Tidak ada skill master yang cocok. Anda tetap dapat menambahkan skill sendiri.</Text>}
              renderItem={({item}) => <Pressable accessibilityRole="button" onPress={() => onToggle(item)} style={styles.option}><Text style={styles.optionText}>{item.name}</Text><Ionicons name="add-circle-outline" size={22} color="#087BFF" /></Pressable>}
            />
            <Pressable onPress={() => setOpen(false)} style={styles.done}><Text style={styles.doneText}>Selesai</Text></Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {gap: 8, marginBottom: 20},
  control: {minHeight: 56, borderRadius: 11, borderColor: '#E0E5EC', paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8},
  controlError: {borderColor: '#FF5B67'},
  chips: {flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 7},
  chip: {flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EEF5FF', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5},
  chipText: {fontFamily: 'PlusJakartaSans_400Regular', color: '#4C8CFF', fontSize: 11},
  placeholder: {fontFamily: 'PlusJakartaSans_400Regular', color: '#B6BCC7', fontSize: 13},
  error: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FF8B93', fontSize: 11},
  overlay: {flex: 1, backgroundColor: 'rgba(1,5,20,0.78)', justifyContent: 'center', padding: 12},
  modal: {backgroundColor: 'white', borderRadius: 22, width: '100%', maxWidth: 430, maxHeight: '82%', alignSelf: 'center', padding: 18},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  title: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20},
  searchFrame: {height: 46, borderRadius: 10, borderColor: '#D9DFE8', paddingHorizontal: 13, marginVertical: 14},
  search: {height: 42, paddingVertical: 0, color: '#111827', fontFamily: 'PlusJakartaSans_400Regular'},
  option: {minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  optionText: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, flex: 1},
  customOption: {minHeight: 58, borderRadius: 12, backgroundColor: '#EEF5FF', paddingHorizontal: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10},
  customCopy: {flex: 1, minWidth: 0},
  customTitle: {fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#087BFF'},
  customName: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: '#4B5563', marginTop: 2},
  empty: {fontFamily: 'PlusJakartaSans_400Regular', color: '#6B7280', textAlign: 'center', padding: 30},
  done: {height: 48, borderRadius: 11, backgroundColor: '#087BFF', alignItems: 'center', justifyContent: 'center', marginTop: 14},
  doneText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white'},
});
