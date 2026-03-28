// @ts-nocheck
import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePlayer } from '../src/store/playerStore';
import MiniPlayer from '../src/components/MiniPlayer';
import NowPlayingScreen from '../src/components/NowPlayingScreen';

export default function RootLayout() {
  const { showNowPlaying, currentTrack } = usePlayer();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1 }}>
          <Slot />
          {currentTrack && !showNowPlaying && <MiniPlayer />}
          {showNowPlaying && <NowPlayingScreen />}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

