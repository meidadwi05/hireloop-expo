import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

export function FullScreenLoader({label = 'Memuat HireLoop...'}: {label?: string}) {
  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color="#0865FF" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FC', gap: 12},
  label: {fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: '#667085'},
});
