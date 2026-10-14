
import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

type ArtworkProps = {
  variant?: number;
  dark?: boolean;
};

export function Artwork({
  variant = 0,
  dark = false,
}: ArtworkProps) {

  const getImage = () => {
    switch (variant) {
      case 0:
        return require('../assets/Onboarding1.png');

      case 1:
        return require('../assets/Onboarding2.png');

      case 2:
        return require('../assets/Onboarding1.png');

      case 3:
        return require('../assets/Onboarding2.png');

      case 4:
        return require('../assets/Onboarding1.png');

      default:
        return require('../assets/Onboarding1.png');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: dark ? '#050D49' : '#FFFFFF',
        },
      ]}
    >
      <Image
        source={getImage()}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel={
          variant === 4
            ? 'Ilustrasi lupa kata sandi HireLoop'
            : 'Ilustrasi onboarding HireLoop'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },
});
