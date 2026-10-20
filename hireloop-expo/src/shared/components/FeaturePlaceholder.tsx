import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export function FeaturePlaceholder({title, description}: {title: string; description: string}) {
  return (
    <View style={styles.screen}>
      <View style={styles.icon}>
        <Ionicons name="construct-outline" size={34} color="#0865FF" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F7F8FC', alignItems: 'center', justifyContent: 'center', padding: 32},
  icon: {width: 70, height: 70, borderRadius: 24, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center'},
  title: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 21, color: '#111318', marginTop: 18},
  description: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, lineHeight: 19, color: '#667085', textAlign: 'center', marginTop: 8},
});
