import MaskedView from '@react-native-masked-view/masked-view';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {StyleSheet, Text} from 'react-native';

export function GradientIntroTitle({children}: {children: string}) {
  return (
    <MaskedView
      style={styles.mask}
      maskElement={<Text style={styles.title}>{children}</Text>}
      testID="gradient-intro-title"
    >
      <LinearGradient
        colors={['#0051FD', '#00DAFD']}
        end={{x: 1, y: 0.5}}
        start={{x: 0, y: 0.5}}
        style={styles.gradient}
      >
        <Text style={[styles.title, styles.transparent]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {width: '100%', minHeight: 72, marginTop: 18},
  gradient: {width: '100%', minHeight: 72},
  title: {
    width: '100%',
    minHeight: 72,
    color: '#0051FD',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 26,
    lineHeight: 34,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  transparent: {opacity: 0},
});
