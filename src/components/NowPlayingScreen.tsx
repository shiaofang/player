import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  Animated, Dimensions, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { usePlayer } from '../store/playerStore';
import Colors from '../theme/colors';
import { formatDuration } from '../data/mockData';

const { width, height } = Dimensions.get('window');
const ARTWORK_SIZE = width - 64;

export default function NowPlayingScreen() {
  const {
    currentTrack, isPlaying, isLoading, duration, position,
    togglePlay, playNext, playPrev, seekTo,
    isShuffle, toggleShuffle, repeatMode, toggleRepeat,
    setShowNowPlaying, volume, setVolume,
  } = usePlayer();

  const seekingRef = useRef(false);
  const [seekValue, setSeekValue] = useState(0);

  const displayPosition = seekingRef.current ? seekValue : position;

  const artworkScale = useRef(new Animated.Value(isPlaying ? 1 : 0.85)).current;
  const slideY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.spring(slideY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, []);

  useEffect(() => {
    Animated.spring(artworkScale, {
      toValue: isPlaying ? 1 : 0.85,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }, [isPlaying]);

  const onSeekStart = useCallback(() => {
    seekingRef.current = true;
    setSeekValue(position);
  }, [position]);

  const onSeekChange = useCallback((val: number) => {
    setSeekValue(val);
  }, []);

  const onSeekComplete = useCallback((val: number) => {
    seekTo(val);
    seekingRef.current = false;
  }, [seekTo]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => {
        if (seekingRef.current) return false;
        return g.dy > 10 && Math.abs(g.dy) > Math.abs(g.dx);
      },
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) slideY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.6) {
          Animated.timing(slideY, {
            toValue: height,
            useNativeDriver: true,
            duration: 300,
          }).start(() => setShowNowPlaying(false));
        } else {
          Animated.spring(slideY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  if (!currentTrack) return null;

  const repeatActive = repeatMode !== 'none';

  return (
    <Animated.View style={[styles.root, { transform: [{ translateY: slideY }] }]}>
      <Image source={{ uri: currentTrack.artwork }} style={styles.bgImage} blurRadius={40} />
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setShowNowPlaying(false)} style={styles.topBtn}>
            <Ionicons name="chevron-down" size={28} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.topLabel}>Now Playing</Text>
          </View>
          <TouchableOpacity style={styles.topBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.artworkContainer}>
          <Animated.View style={[styles.artworkShadow, { transform: [{ scale: artworkScale }] }]}>
            <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
          </Animated.View>
        </View>

        <View style={styles.trackInfo}>
          <View style={styles.trackInfoLeft}>
            <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
          <TouchableOpacity style={styles.heartBtn}>
            <Ionicons name="heart" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={displayPosition}
            onSlidingStart={onSeekStart}
            onValueChange={onSeekChange}
            onSlidingComplete={onSeekComplete}
            minimumTrackTintColor={Colors.text}
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor={Colors.text}
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatDuration(Math.floor(displayPosition))}</Text>
            <Text style={styles.timeText}>-{formatDuration(Math.max(0, Math.floor(duration - displayPosition)))}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={toggleShuffle} style={styles.controlBtn}>
            <Ionicons name="shuffle" size={22} color={isShuffle ? Colors.primary : Colors.text} />
            {isShuffle && <View style={styles.activeDot} />}
          </TouchableOpacity>

          <TouchableOpacity onPress={playPrev} style={styles.controlBtnLarge}>
            <Ionicons name="play-skip-back" size={34} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay} style={styles.playPauseBtn} activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicatorIcon />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={34}
                color={Colors.background}
                style={isPlaying ? {} : { marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext} style={styles.controlBtnLarge}>
            <Ionicons name="play-skip-forward" size={34} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleRepeat} style={styles.controlBtn}>
            <Ionicons
              name={repeatMode === 'one' ? 'repeat-sharp' : 'repeat'}
              size={22}
              color={repeatActive ? Colors.primary : Colors.text}
            />
            {repeatActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.bottomBtn}>
            <Ionicons name="radio" size={22} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.volumeContainer}>
            <Ionicons name="volume-low" size={16} color={Colors.textTertiary} />
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onSlidingComplete={setVolume}
              minimumTrackTintColor={Colors.text}
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor={Colors.text}
            />
            <Ionicons name="volume-high" size={16} color={Colors.textTertiary} />
          </View>
          <TouchableOpacity style={styles.bottomBtn}>
            <Ionicons name="list" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

function ActivityIndicatorIcon() {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Ionicons name="reload" size={34} color={Colors.background} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    backgroundColor: Colors.background,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  dragArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBtn: {
    padding: 4,
    width: 44,
    alignItems: 'center',
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  artworkContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    flex: 1,
    justifyContent: 'center',
  },
  artworkShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 12,
  },
  trackInfoLeft: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '400',
  },
  heartBtn: {
    padding: 8,
    marginLeft: 12,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  controlBtnLarge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    position: 'absolute',
    bottom: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  bottomBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 8,
  },
  volumeSlider: {
    flex: 1,
    height: 36,
  },
});
