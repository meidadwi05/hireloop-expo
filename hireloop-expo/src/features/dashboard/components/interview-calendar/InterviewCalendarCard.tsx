import Ionicons from '@expo/vector-icons/Ionicons';
import React, {useMemo} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import type {DashboardInterview} from '../../dashboard.types';
import {
  buildCalendarCells,
  CALENDAR_MONTHS,
  CALENDAR_WEEKDAYS,
  calendarYearOptions,
  interviewDateSet,
  localDateKey,
} from './interview-calendar.utils';

const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

type OpenDropdown = 'month' | 'year' | null;

function CalendarSelect({
  label,
  open,
  options,
  onOpen,
  onSelect,
  width,
  icon,
  testID,
}: {
  label: string;
  open: boolean;
  options: Array<{label: string; value: number}>;
  onOpen: () => void;
  onSelect: (value: number) => void;
  width: number;
  icon?: boolean;
  testID: string;
}) {
  return (
    <View style={[styles.selectWrap, {width}]}>
      <Pressable
        accessibilityLabel={`Pilih ${testID === 'calendar-month-select' ? 'bulan' : 'tahun'}, saat ini ${label}`}
        accessibilityRole="button"
        accessibilityState={{expanded: open}}
        onPress={onOpen}
        style={[styles.selectField, open && styles.selectFieldOpen]}
        testID={testID}
      >
        {icon ? <Ionicons name="calendar-outline" size={16} color="#071C4D" /> : null}
        <Text numberOfLines={1} style={styles.selectLabel}>{label}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#071C4D" />
      </Pressable>
      {open ? (
        <View style={styles.dropdown} testID={`${testID}-dropdown`}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {options.map(option => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => onSelect(option.value)}
                style={({pressed}) => [styles.dropdownOption, pressed && styles.dropdownOptionPressed]}
              >
                <Text style={[styles.dropdownOptionText, option.label === label && styles.dropdownOptionTextActive]}>{option.label}</Text>
                {option.label === label ? <Ionicons name="checkmark" size={16} color="#0051FD" /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export function InterviewCalendarCard({
  compact,
  interviews,
  selectedDate,
  visibleMonth,
  visibleYear,
  openDropdown,
  onChangeMonth,
  onChangeYear,
  onChangeOpenDropdown,
  onSelectDate,
  today = new Date(),
}: {
  compact: boolean;
  interviews: DashboardInterview[];
  selectedDate: string | null;
  visibleMonth: number;
  visibleYear: number;
  openDropdown: OpenDropdown;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
  onChangeOpenDropdown: (value: OpenDropdown) => void;
  onSelectDate: (date: string | null) => void;
  today?: Date;
}) {
  const cells = useMemo(() => buildCalendarCells(visibleYear, visibleMonth), [visibleMonth, visibleYear]);
  const eventDates = useMemo(() => interviewDateSet(interviews), [interviews]);
  const eventCounts = useMemo(() => interviews.reduce<Record<string, number>>((result, interview) => {
    const key = localDateKey(interview.date);
    if (key) result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {}), [interviews]);
  const years = useMemo(() => calendarYearOptions(interviews, today), [interviews, today]);
  const todayKey = localDateKey(today);

  const selectToday = () => {
    onChangeMonth(today.getMonth());
    onChangeYear(today.getFullYear());
    onChangeOpenDropdown(null);
    onSelectDate(todayKey);
  };

  return (
    <View style={styles.card} testID="interview-calendar-card">
      {openDropdown ? <Pressable accessibilityLabel="Tutup pilihan kalender" onPress={() => onChangeOpenDropdown(null)} style={styles.dismissLayer} /> : null}
      <View style={[styles.calendarHeader, compact && styles.calendarHeaderCompact]}>
        <View style={styles.calendarTitleRow}>
          <Ionicons name="calendar-outline" size={21} color="#111827" />
          <Text style={styles.calendarTitle}>Kalender</Text>
        </View>
        <View style={styles.filters}>
          <CalendarSelect
            icon
            label={CALENDAR_MONTHS[visibleMonth]}
            onOpen={() => onChangeOpenDropdown(openDropdown === 'month' ? null : 'month')}
            onSelect={value => {
              onChangeMonth(value);
              onChangeOpenDropdown(null);
            }}
            open={openDropdown === 'month'}
            options={CALENDAR_MONTHS.map((label, value) => ({label, value}))}
            testID="calendar-month-select"
            width={compact ? 142 : 150}
          />
          <CalendarSelect
            label={String(visibleYear)}
            onOpen={() => onChangeOpenDropdown(openDropdown === 'year' ? null : 'year')}
            onSelect={value => {
              onChangeYear(value);
              onChangeOpenDropdown(null);
            }}
            open={openDropdown === 'year'}
            options={years.map(value => ({label: String(value), value}))}
            testID="calendar-year-select"
            width={compact ? 92 : 96}
          />
        </View>
      </View>

      <View style={styles.weekdays}>
        {CALENDAR_WEEKDAYS.map(day => <Text key={day} style={styles.weekday}>{day}</Text>)}
      </View>
      <View style={styles.grid}>
        {cells.map(cell => {
          const selected = selectedDate === cell.key;
          const isToday = todayKey === cell.key;
          const eventCount = eventCounts[cell.key] ?? 0;
          return (
            <View key={cell.key} style={styles.cellSlot}>
              <Pressable
                accessibilityLabel={`${cell.date.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}${eventCount ? `, ${eventCount} interview` : ''}${isToday ? ', hari ini' : ''}`}
                accessibilityRole="button"
                accessibilityState={{disabled: !cell.inCurrentMonth, selected}}
                disabled={!cell.inCurrentMonth}
                onPress={() => {
                  onChangeOpenDropdown(null);
                  onSelectDate(selected ? null : cell.key);
                }}
                style={[styles.dayButton, selected && styles.dayButtonSelected, isToday && !selected && styles.dayButtonToday]}
                testID={`calendar-day-${cell.key}`}
              >
                <Text style={[styles.dayText, !cell.inCurrentMonth && styles.dayTextMuted, selected && styles.dayTextSelected]}>{cell.day}</Text>
                <View style={[styles.dotSlot, eventDates.has(cell.key) && styles.eventDot, selected && eventDates.has(cell.key) && styles.eventDotSelected]} />
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.calendarFooter}>
        <Pressable accessibilityRole="button" onPress={selectToday} style={styles.todayButton}>
          <Text style={styles.todayText}>Hari ini</Text>
        </Pressable>
      </View>
    </View>
  );
}

const shadow = {
  shadowColor: '#17376D',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.09,
  shadowRadius: 10,
  elevation: 3,
};

const styles = StyleSheet.create({
  card: {...shadow, position: 'relative', overflow: 'visible', borderWidth: 1, borderColor: '#DCE3EE', borderRadius: 20, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, zIndex: 5},
  dismissLayer: {position: 'absolute', zIndex: 10, top: 66, right: 0, bottom: 0, left: 0},
  calendarHeader: {zIndex: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14},
  calendarHeaderCompact: {alignItems: 'flex-start', flexDirection: 'column'},
  calendarTitleRow: {minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8},
  calendarTitle: {fontFamily: F.bold, fontSize: 17, lineHeight: 22, color: '#111827'},
  filters: {flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end'},
  selectWrap: {position: 'relative', zIndex: 30},
  selectField: {height: 44, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#D6DDE8', borderRadius: 11, backgroundColor: '#FFFFFF', paddingHorizontal: 10},
  selectFieldOpen: {borderColor: '#0051FD', borderWidth: 1.5},
  selectLabel: {flex: 1, minWidth: 0, fontFamily: F.medium, fontSize: 11, color: '#111827'},
  dropdown: {...shadow, position: 'absolute', zIndex: 40, top: 48, right: 0, width: '100%', maxHeight: 240, overflow: 'hidden', borderWidth: 1, borderColor: '#D6DDE8', borderRadius: 11, backgroundColor: '#FFFFFF'},
  dropdownOption: {minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, paddingHorizontal: 11},
  dropdownOptionPressed: {backgroundColor: '#EEF5FF'},
  dropdownOptionText: {fontFamily: F.medium, fontSize: 10.5, color: '#344054'},
  dropdownOptionTextActive: {fontFamily: F.semibold, color: '#0051FD'},
  weekdays: {flexDirection: 'row'},
  weekday: {width: '14.2857%', fontFamily: F.medium, fontSize: 10, color: '#7B8494', textAlign: 'center'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 7},
  cellSlot: {width: '14.2857%', alignItems: 'center', justifyContent: 'center'},
  dayButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent', borderRadius: 9},
  dayButtonSelected: {borderColor: '#0876E8', backgroundColor: '#EAF4FF'},
  dayButtonToday: {backgroundColor: '#F2F7FF'},
  dayText: {fontFamily: F.medium, fontSize: 11.5, lineHeight: 16, color: '#111827'},
  dayTextMuted: {color: '#C7CCD5'},
  dayTextSelected: {fontFamily: F.semibold, color: '#075DB8'},
  dotSlot: {width: 5, height: 5, borderRadius: 3, marginTop: 2},
  eventDot: {backgroundColor: '#0876E8'},
  eventDotSelected: {backgroundColor: '#0051FD'},
  calendarFooter: {minHeight: 38, alignItems: 'flex-end', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#E9EDF3', marginTop: 9},
  todayButton: {minWidth: 58, minHeight: 38, alignItems: 'center', justifyContent: 'center'},
  todayText: {fontFamily: F.semibold, fontSize: 10, color: '#45637F'},
});
