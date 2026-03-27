import React, { useRef, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Animated, PanResponder, Dimensions, Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import Colors from '../theme/colors';

const { width } = Dimensions.get('window');

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, playNext, setShowNowPlaying, position, duration } = usePlayer();
  const progress = duration > 0 ? position / duration : 0;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx);
        opacity.setValue(1 - Math.abs(g.dx) / (width * 0.6));
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -80) {
          Animated.parallel([
            Animated.timing(translateX, { toValue: -width, useNativeDriver: true, duration: 200 }),
            Animated.timing(opacity, { toValue: 0, useNativeDriver: true, duration: 200 }),
          ]).start(() => {
            translateX.setValue(0);
            opacity.setValue(1);
            playNext();
          });
        } else {
          Animated.parallel([
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  if (!currentTrack) return null;

  return (
    <TouchableOpacity
      onPress={() => setShowNowPlaying(true)}
      activeOpacity={1}
      style={styles.wrapper}
    >
      <Animated.View
        style={[styles.container, { transform: [{ translateX }], opacity }]}
        {...panResponder.panHandlers}
      >
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.content}>
          <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
          <TouchableOpacity onPress={togglePlay} style={styles.btn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={playNext} style={styles.btn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="play-skip-forward-sharp" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 64,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  container: {
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(44,44,46,0.85)',
  },
  progressBar: {
    height: 2,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: 2,
    backgroundColor: Colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  artist: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  btn: {
    padding: 4,
    marginLeft: 8,
  },
});
