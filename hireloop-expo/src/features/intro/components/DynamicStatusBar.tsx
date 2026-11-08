import {StatusBar} from 'expo-status-bar';
import React from 'react';

import type {IntroSlide} from '../intro.types';

export function DynamicStatusBar({theme}: {theme: IntroSlide['theme']}) {
  return <StatusBar animated style={theme === 'light' ? 'dark' : 'light'} />;
}
