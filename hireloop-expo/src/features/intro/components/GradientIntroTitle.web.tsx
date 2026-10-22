import React from 'react';
import {StyleSheet, View} from 'react-native';

export function GradientIntroTitle({children}: {children: string}) {
  return (
    <View style={styles.wrapper} testID="gradient-intro-title">
      <span style={webTitleStyle}>{children}</span>
    </View>
  );
}

const webTitleStyle: React.CSSProperties = {
  backgroundImage: 'linear-gradient(90deg, #0051FD 0%, #00DAFD 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: '#0051FD',
  display: 'block',
  fontFamily: 'PlusJakartaSans_700Bold',
  fontSize: 26,
  lineHeight: '34px',
  minHeight: 72,
  textAlign: 'center',
  WebkitTextFillColor: 'transparent',
  width: '100%',
};

const styles = StyleSheet.create({
  wrapper: {width: '100%', minHeight: 72, marginTop: 18},
});
