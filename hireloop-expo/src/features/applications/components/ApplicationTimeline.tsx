import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import type {ApplicationStage} from '../applications.types';
import {APPLICATION_COLORS, APPLICATION_FONTS, formatApplicationDate} from './applications.ui';

function stageTone(stage: ApplicationStage) {
  const terminal = ['canceled', 'rejected'].includes(stage.value.toLowerCase());
  if (terminal) return APPLICATION_COLORS.red;
  if (stage.isCurrent) return APPLICATION_COLORS.blue;
  if (stage.isCompleted) return APPLICATION_COLORS.green;
  return APPLICATION_COLORS.future;
}

export function ApplicationHorizontalTimeline({stages}: {stages: ApplicationStage[]}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
      {stages.map((stage, index) => {
        const color = stageTone(stage);
        const negative = ['canceled', 'rejected'].includes(stage.value.toLowerCase());
        return (
          <View key={`${stage.value}-${stage.index}`} style={styles.horizontalStage}>
            {index < stages.length - 1 && (
              <View style={[styles.horizontalLine, {backgroundColor: stage.isCompleted ? APPLICATION_COLORS.green : APPLICATION_COLORS.future}]} />
            )}
            <View style={[styles.node, {backgroundColor: stage.isCurrent || stage.isCompleted ? color : 'white', borderColor: color}]}>
              {negative
                ? <Ionicons name="close" size={13} color="white" />
                : stage.isCompleted
                  ? <Ionicons name="checkmark" size={13} color="white" />
                  : stage.isCurrent
                    ? <View style={styles.currentDot} />
                    : null}
            </View>
            <Text numberOfLines={2} style={[styles.horizontalLabel, (stage.isCurrent || stage.isCompleted) && styles.reachedLabel]}>
              {stage.label}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

export function ApplicationVerticalTimeline({stages}: {stages: ApplicationStage[]}) {
  return (
    <View style={styles.verticalList}>
      {stages.map((stage, index) => {
        const color = stageTone(stage);
        const negative = ['canceled', 'rejected'].includes(stage.value.toLowerCase());
        const date = stage.completedAt ?? stage.startedAt;
        return (
          <View key={`${stage.value}-${stage.index}`} style={styles.verticalRow}>
            <View style={styles.verticalTrack}>
              {index < stages.length - 1 && (
                <View style={[styles.verticalLine, {backgroundColor: stage.isCompleted ? APPLICATION_COLORS.green : APPLICATION_COLORS.future}]} />
              )}
              <View style={[styles.verticalNode, {backgroundColor: stage.isCurrent || stage.isCompleted ? color : 'white', borderColor: color}]}>
                {negative
                  ? <Ionicons name="close" size={15} color="white" />
                  : stage.isCompleted
                    ? <Ionicons name="checkmark" size={15} color="white" />
                    : stage.isCurrent
                      ? <View style={styles.currentDot} />
                      : null}
              </View>
            </View>
            <View style={styles.verticalCopy}>
              <Text style={styles.verticalTitle}>{stage.label}</Text>
              <Text style={[styles.verticalDescription, stage.isCurrent && styles.currentDescription]}>
                {stage.note || (stage.isCurrent ? 'Tahap saat ini' : stage.isCompleted ? 'Tahap selesai' : 'Belum dimulai')}
              </Text>
            </View>
            <Text style={styles.verticalDate}>{formatApplicationDate(date)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalContent: {paddingVertical: 7, paddingHorizontal: 4},
  horizontalStage: {width: 104, alignItems: 'center', position: 'relative'},
  horizontalLine: {position: 'absolute', height: 2, width: 80, left: 64, top: 12},
  node: {width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center', zIndex: 1},
  currentDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: 'white'},
  horizontalLabel: {width: 96, marginTop: 7, fontFamily: APPLICATION_FONTS.medium, fontSize: 10.5, lineHeight: 14, textAlign: 'center', color: APPLICATION_COLORS.muted},
  reachedLabel: {fontFamily: APPLICATION_FONTS.semibold, color: APPLICATION_COLORS.navy},
  verticalList: {marginTop: 8},
  verticalRow: {minHeight: 82, flexDirection: 'row', alignItems: 'flex-start'},
  verticalTrack: {width: 48, alignItems: 'center', alignSelf: 'stretch'},
  verticalNode: {width: 28, height: 28, borderRadius: 14, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', zIndex: 1},
  verticalLine: {position: 'absolute', width: 2, top: 28, bottom: 0},
  verticalCopy: {flex: 1, minWidth: 0, paddingRight: 8},
  verticalTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 13.5, lineHeight: 19, color: APPLICATION_COLORS.navy},
  verticalDescription: {fontFamily: APPLICATION_FONTS.regular, fontSize: 11, lineHeight: 17, color: APPLICATION_COLORS.body, marginTop: 2},
  currentDescription: {fontFamily: APPLICATION_FONTS.semibold, color: APPLICATION_COLORS.blue},
  verticalDate: {width: 105, fontFamily: APPLICATION_FONTS.medium, fontSize: 9.5, lineHeight: 16, textAlign: 'right', color: APPLICATION_COLORS.body},
});
