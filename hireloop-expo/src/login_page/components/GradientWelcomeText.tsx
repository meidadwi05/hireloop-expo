import MaskedView from '@react-native-masked-view/masked-view';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {StyleSheet, Text} from 'react-native';

import {LOGIN_WELCOME_GRADIENT_COLORS} from './gradient-welcome.constants';

export function GradientWelcomeText() {
  return (
    <MaskedView
      maskElement={<Text style={styles.text}>Selamat Datang!</Text>}
      style={styles.mask}
      testID="login-welcome-gradient"
    >
      <LinearGradient
        colors={LOGIN_WELCOME_GRADIENT_COLORS}
        end={{x: 1, y: 0.5}}
        start={{x: 0, y: 0.5}}
      >
        <Text style={[styles.text, styles.transparent]}>Selamat Datang!</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {alignSelf: 'flex-start'},
  text: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, letterSpacing: -0.5},
  transparent: {opacity: 0},
});
