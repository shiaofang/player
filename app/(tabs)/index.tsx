// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../src/theme/colors';
import { ALBUMS, PLAYLISTS } from '../../src/data/mockData';
import AlbumCard from '../../src/components/AlbumCard';
import { usePlayer } from '../../src/store/playerStore';
import { fetchPlaylist, apiTrackToTrack } from '../../src/services/musicApi';

const PLAYLIST_ID = '3778678'; // 华语流行

export default function HomeScreen() {
  const { playTrack } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await fetchPlaylist(PLAYLIST_ID);
      if (cancelled) return;
      if (result && result.tracks) {
        setTracks(result.tracks.map(apiTrackToTrack));
        setPlaylist(result);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (tracks.length === 0) return <ErrorState />;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.greeting}>为你推荐</Text>
          </View>
        </SafeAreaView>

        <FeaturedBanner tracks={tracks.slice(0, 5)} onPlay={playTrack} />

        {playlist && (
          <PlaylistInfoBar
            name={playlist.name}
            count={playlist.trackCount}
            plays={playlist.playCount}
            onPlayAll={() => playTrack(tracks[0], tracks)}
            onShuffle={() => {
              const shuffled = [...tracks].sort(() => Math.random() - 0.5);
              playTrack(shuffled[0], shuffled);
            }}
          />
        )}

        <Section title="新碟上架">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding}>
            {ALBUMS.map(item => (
              <AlbumCard
                key={item.id}
                artwork={item.artwork}
                title={item.title}
                subtitle={item.artist}
                size={150}
                onPress={() => playTrack(item.tracks[0], item.tracks)}
                style={undefined}
              />
            ))}
          </ScrollView>
        </Section>

        <Section title="精选歌单">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding}>
            {PLAYLISTS.map(item => (
              <AlbumCard
                key={item.id}
                artwork={item.artwork}
                title={item.title}
                subtitle={item.curator || '歌单'}
                size={160}
                onPress={() => playTrack(item.tracks[0], item.tracks)}
                style={undefined}
              />
            ))}
          </ScrollView>
        </Section>

        <Section title="排行榜">
          {tracks.slice(0, 10).map((track, idx) => (
            <TopTrackRow key={track.id} track={track} index={idx} onPlay={() => playTrack(track, tracks)} />
          ))}
        </Section>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeaturedBanner({ tracks, onPlay }) {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const track = tracks[featuredIdx];

  return (
    <View>
      <TouchableOpacity style={styles.featured} onPress={() => onPlay(track, tracks)} activeOpacity={0.95}>
        <Image source={{ uri: track.artwork }} style={styles.featuredImage} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} style={styles.featuredGradient}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>经典好歌</Text>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={1}>{track.title}</Text>
          <Text style={styles.featuredArtist} numberOfLines={1}>{track.artist}</Text>
          <View style={styles.featuredActions}>
            <TouchableOpacity style={styles.playBtn} onPress={() => onPlay(track, tracks)}>
              <Ionicons name="play-circle" size={16} color="#fff" />
              <Text style={styles.playBtnText}>播放</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shuffleBtn}
              onPress={() =>
                onPlay(
                  tracks[Math.floor(Math.random() * tracks.length)],
                  [...tracks].sort(() => Math.random() - 0.5),
                )
              }
            >
              <Text style={styles.shuffleBtnText}>随机播放</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.dotsRow}>
        {tracks.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setFeaturedIdx(i)} style={[styles.dot, i === featuredIdx && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function PlaylistInfoBar({ name, count, plays, onPlayAll, onShuffle }) {
  const formatPlays = (n) =>
    n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n);

  return (
    <View style={styles.infoBar}>
      <View style={styles.infoBarLeft}>
        <Text style={styles.infoBarName} numberOfLines={1}>{name}</Text>
        <Text style={styles.infoBarMeta}>{count} 首  ·  {formatPlays(plays)} 次播放</Text>
      </View>
      <View style={styles.infoBarActions}>
        <TouchableOpacity style={styles.infoBarBtn} onPress={onShuffle}>
          <Ionicons name="shuffle" size={18} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.infoBarBtn, styles.infoBarPlayBtn]} onPress={onPlayAll}>
          <Ionicons name="play" size={16} color="#fff" />
          <Text style={styles.infoBarPlayText}>全部播放</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function TopTrackRow({ track, index, onPlay }) {
  return (
    <TouchableOpacity style={styles.topTrack} onPress={onPlay} activeOpacity={0.7}>
      <Text style={styles.topTrackNum}>{index + 1}</Text>
      <Image source={{ uri: track.artwork }} style={styles.topTrackArt} />
      <View style={styles.topTrackInfo}>
        <Text style={styles.topTrackTitle} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.topTrackArtist} numberOfLines={1}>{track.artist}</Text>
      </View>
      <Ionicons name="play" size={14} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

function LoadingSkeleton() {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.greeting}>加载中…</Text>
        </View>
      </SafeAreaView>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    </View>
  );
}

function ErrorState() {
  return (
    <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name="cloud-offline-outline" size={64} color={Colors.textMuted} />
      <Text style={{ color: Colors.text, fontSize: 18, marginTop: 16 }}>加载失败</Text>
      <Text style={{ color: Colors.textTertiary, fontSize: 14, marginTop: 8 }}>请检查网络后重试</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  featured: {
    height: 280,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    padding: 16,
    justifyContent: 'flex-end',
  },
  featuredBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  featuredArtist: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  featuredActions: {
    flexDirection: 'row',
    gap: 10,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  shuffleBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shuffleBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceSecondary,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 18,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 4,
  },
  infoBarLeft: {
    flex: 1,
    marginRight: 12,
  },
  infoBarName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 3,
  },
  infoBarMeta: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  infoBarActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  infoBarBtn: {
    padding: 8,
  },
  infoBarPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  infoBarPlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  listPadding: {
    paddingHorizontal: 20,
  },
  topTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  topTrackNum: {
    width: 24,
    fontSize: 16,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  topTrackArt: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginLeft: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  topTrackInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  topTrackTitle: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '400',
    marginBottom: 2,
  },
  topTrackArtist: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
});
