import React from 'react';
import {StyleSheet, View} from 'react-native';

export function GradientIntroTitle({children, compact = false}: {children: string; compact?: boolean}) {
  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]} testID="gradient-intro-title">
      <span style={{...webTitleStyle, ...(compact ? compactWebTitleStyle : {})}}>{children}</span>
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
  fontSize: 28,
  lineHeight: '36px',
  minHeight: 76,
  textAlign: 'center',
  WebkitTextFillColor: 'transparent',
  width: '100%',
};

const compactWebTitleStyle: React.CSSProperties = {
  fontSize: 24,
  lineHeight: '31px',
  minHeight: 64,
};

const styles = StyleSheet.create({
  wrapper: {width: '100%', minHeight: 76, marginTop: 18},
  wrapperCompact: {minHeight: 64, marginTop: 10},
});
