import {Ionicons} from '@expo/vector-icons';
import React, {useMemo, useState} from 'react';
import {FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import type {SelectedSkill, SkillOption} from '../onboarding.types';
import {FieldLabel} from './FormControls';

export function SkillMultiSelect({options, selected, onToggle, error}: {
  options: SkillOption[];
  selected: SelectedSkill[];
  onToggle: (skill: SkillOption) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => options.filter(option => option.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 100), [options, query]);
  return (
    <View style={styles.group}>
      <FieldLabel label="Keahlian" required />
      <Pressable accessibilityRole="button" accessibilityLabel="Pilih keahlian" onPress={() => setOpen(true)} style={[styles.control, error && styles.controlError]}>
        <View style={styles.chips}>
          {selected.length ? selected.map(skill => (
            <View key={`${skill.skillId}-${skill.name}`} style={styles.chip}>
              <Text style={styles.chipText}>{skill.name}</Text>
              <Pressable accessibilityLabel={`Hapus ${skill.name}`} onPress={() => onToggle({id: skill.skillId ?? 0, name: skill.name})} hitSlop={8}><Ionicons name="close" size={14} color="#4C8CFF" /></Pressable>
            </View>
          )) : <Text style={styles.placeholder}>Cari keahlian</Text>}
        </View>
        <Ionicons name="chevron-down" size={19} color="#172036" />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}><Text style={styles.title}>Pilih Keahlian</Text><Pressable onPress={() => setOpen(false)}><Ionicons name="close" size={25} /></Pressable></View>
            <TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Cari keahlian" style={styles.search} />
            <FlatList
              data={filtered}
              keyExtractor={item => String(item.id)}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.empty}>Keahlian tidak ditemukan</Text>}
              renderItem={({item}) => {
                const checked = selected.some(skill => skill.skillId === item.id);
                return <Pressable accessibilityRole="checkbox" accessibilityState={{checked}} onPress={() => onToggle(item)} style={styles.option}><Text style={styles.optionText}>{item.name}</Text>{checked ? <Ionicons name="checkmark-circle" size={22} color="#087BFF" /> : null}</Pressable>;
              }}
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
  control: {minHeight: 56, backgroundColor: 'white', borderRadius: 11, borderWidth: 1, borderColor: '#E0E5EC', paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8},
  controlError: {borderColor: '#FF5B67'},
  chips: {flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 7},
  chip: {flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EEF5FF', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5},
  chipText: {fontFamily: 'PlusJakartaSans_400Regular', color: '#4C8CFF', fontSize: 11},
  placeholder: {fontFamily: 'PlusJakartaSans_400Regular', color: '#B6BCC7', fontSize: 13},
  error: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FF8B93', fontSize: 11},
  overlay: {flex: 1, backgroundColor: 'rgba(1,5,20,0.78)', justifyContent: 'center', padding: 22},
  modal: {backgroundColor: 'white', borderRadius: 22, width: '100%', maxWidth: 430, maxHeight: '82%', alignSelf: 'center', padding: 18},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  title: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20},
  search: {height: 46, borderRadius: 10, borderWidth: 1, borderColor: '#D9DFE8', paddingHorizontal: 13, marginVertical: 14, fontFamily: 'PlusJakartaSans_400Regular'},
  option: {minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  optionText: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, flex: 1},
  empty: {fontFamily: 'PlusJakartaSans_400Regular', color: '#6B7280', textAlign: 'center', padding: 30},
  done: {height: 48, borderRadius: 11, backgroundColor: '#087BFF', alignItems: 'center', justifyContent: 'center', marginTop: 14},
  doneText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white'},
});
