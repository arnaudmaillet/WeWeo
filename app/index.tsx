import { Stack, Link } from 'expo-router';
import React from 'react';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import HomeScreen from '~/screens/HomeScreen';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />
      <HomeScreen />
    </>
  );
}
