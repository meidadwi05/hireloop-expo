import {Redirect} from 'expo-router';
import React from 'react';

export default function SavedJobsRoute() {
  return <Redirect href={'/(candidate)/(tabs)/saved' as never} />;
}
