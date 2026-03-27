import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track, formatDuration } from '../data/mockData';
import { usePlayer } from '../context/PlayerContext';
import Colors from '../theme/colors';

interface Props {
  track: Track;
  queue?: Track[];
  showIndex?: number;
  onMorePress?: (track: Track) => void;
}

export default function TrackItem({ track, queue, showIndex, onMorePress }: Props) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const isActive = currentTrack?.id === track.id;

  return (
    <TouchableOpacity style={styles.container} onPress={() => playTrack(track, queue)} activeOpacity={0.7}>
      {showIndex !== undefined ? (
        <View style={styles.indexContainer}>
          {isActive && isPlaying ? (
            <View style={styles.playingIndicator}>
              {[0.4, 1, 0.6].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h * 16 }]} />
              ))}
            </View>
          ) : (
            <Text style={[styles.index, isActive && { color: Colors.primary }]}>{showIndex + 1}</Text>
          )}
        </View>
      ) : (
        <Image source={{ uri: track.artwork }} style={styles.artwork} />
      )}
      <View style={styles.info}>
        <Text style={[styles.title, isActive && { color: Colors.primary }]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
      <TouchableOpacity onPress={() => onMorePress?.(track)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  indexContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  index: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    gap: 2,
  },
  bar: {
    width: 3,
    height: 16,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: Colors.surfaceSecondary,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '400',
    marginBottom: 2,
  },
  artist: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  duration: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginRight: 12,
  },
});
