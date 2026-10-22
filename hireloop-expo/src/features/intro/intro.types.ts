import type {ImageSourcePropType} from 'react-native';

export type IntroSlide = {
  id: 'discover' | 'tracking' | 'multi-apply' | 'recommendation';
  image: ImageSourcePropType;
  theme: 'light' | 'dark';
  titleVariant: 'gradient' | 'solid';
  title: string;
  body: string;
};

export type WelcomePhase = 'splash' | 'slides';
