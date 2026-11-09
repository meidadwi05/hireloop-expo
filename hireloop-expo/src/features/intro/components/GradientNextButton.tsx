import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

type GradientNextButtonProps = {
  height: number;
  isLast: boolean;
  onPress: () => void;
  radius: number;
};

export function GradientNextButton({height, isLast, onPress, radius}: GradientNextButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, {borderRadius: radius, height}]}>
      <LinearGradient
        colors={['#0051FD', '#00DAFD']}
        end={{x: 1, y: 0.5}}
        start={{x: 0, y: 0.5}}
        style={styles.gradient}
      >
        <View style={styles.labelRow} testID="intro-next-label-row">
          <Text style={styles.label} testID="intro-next-label">{isLast ? 'Mulai Sekarang' : 'Selanjutnya'}</Text>
          <Text accessibilityElementsHidden style={styles.arrow}>→</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {width: '100%', overflow: 'hidden'},
  gradient: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  labelRow: {flex: 1, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative'},
  label: {width: '100%', color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, textAlign: 'center'},
  arrow: {position: 'absolute', right: '18%', color: '#FFFFFF', fontFamily: 'PlusJakartaSans_500Medium', fontSize: 28, lineHeight: 30},
});
