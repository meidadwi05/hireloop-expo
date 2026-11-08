import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';

export function AnimatedProgressLine({progress}: {progress: Animated.Value}) {
  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.progress,
          {transform: [{scaleX: progress}], transformOrigin: 'left center'},
        ]}
        testID="splash-gradient-line"
      >
        <LinearGradient
          colors={['#0051FD', '#00DAFD']}
          end={{x: 1, y: 0.5}}
          start={{x: 0, y: 0.5}}
          style={styles.line}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {width: 138, height: 8, borderRadius: 5, marginTop: 76, overflow: 'hidden'},
  progress: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0},
  line: {flex: 1, borderRadius: 5},
});
