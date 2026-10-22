import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';

export function OnboardingProgress({step}: {step: 1 | 2}) {
  const {width} = useWindowDimensions();
  const narrow = width < 360;
  return (
    <View style={[styles.wrap, narrow && styles.wrapNarrow]} accessibilityLabel={`Langkah ${step} dari 2`}>
      <View style={[styles.node, narrow && styles.nodeNarrow, step === 2 && styles.complete]}>
        {step === 2 ? <Ionicons name="checkmark" size={narrow ? 25 : 30} color="white" /> : <Text style={styles.nodeText}>01</Text>}
      </View>
      <View style={styles.track}><View style={[styles.fill, {width: step === 2 ? '100%' : '45%'}]} /></View>
      <View style={[styles.node, narrow && styles.nodeNarrow, step === 1 ? styles.inactive : null]}><Text style={styles.nodeText}>02</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {height: 102, paddingHorizontal: 46, flexDirection: 'row', alignItems: 'center', backgroundColor: '#010934'},
  wrapNarrow: {height: 88, paddingHorizontal: 24},
  node: {width: 58, height: 58, borderRadius: 29, backgroundColor: '#0865DF', alignItems: 'center', justifyContent: 'center', zIndex: 2},
  nodeNarrow: {width: 50, height: 50, borderRadius: 25},
  inactive: {backgroundColor: '#B9B9BB'},
  complete: {backgroundColor: '#35C763'},
  nodeText: {fontFamily: 'PlusJakartaSans_500Medium', color: 'white', fontSize: 16},
  track: {height: 3, flex: 1, backgroundColor: '#E9EDF4'},
  fill: {height: '100%', backgroundColor: '#0865DF'},
});
