import MaskedView from '@react-native-masked-view/masked-view';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {StyleSheet, Text} from 'react-native';

type GradientTitleProps = {
  children: string;
  fontSize: number;
  lineHeight: number;
};

export function GradientTitle({children, fontSize, lineHeight}: GradientTitleProps) {
  const textStyle = {fontSize, lineHeight};

  return (
    <MaskedView
      style={styles.mask}
      maskElement={<Text style={[styles.title, textStyle]}>{children}</Text>}
      testID="gradient-intro-title"
    >
      <LinearGradient colors={['#0051FD', '#00DAFD']} end={{x: 1, y: 0.5}} start={{x: 0, y: 0.5}}>
        <Text style={[styles.title, textStyle, styles.transparent]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {width: '100%'},
  title: {width: '100%', color: '#0051FD', fontFamily: 'PlusJakartaSans_700Bold', textAlign: 'left'},
  transparent: {opacity: 0},
});
