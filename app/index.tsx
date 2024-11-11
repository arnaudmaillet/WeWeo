import { Redirect } from 'expo-router';
import React from 'react';

// DO NOT REMOVE THIS LINE OTHERWISE SUBSCRIPTIONS WON'T WORK
import 'react-native-get-random-values';

export default function Home() {
  return <Redirect href="/MainScreen" />;
}
