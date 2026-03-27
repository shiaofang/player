import React, { useState } from 'react';
import {
  View, Text, ScrollView, FlatList, StyleSheet,
  TouchableOpacity, Image, SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { TRACKS, ALBUMS, ARTISTS, PLAYLISTS } from '../data/mockData';
import { usePlayer } from '../context/PlayerContext';
import AlbumCard from '../components/AlbumCard';
import TrackItem from '../components/TrackItem';

type Tab = 'Playlists' | 'Albums' | 'Artists' | 'Songs';
const TABS: Tab[] = ['Playlists', 'Albums', 'Artists', 'Songs'];

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Playlists');
  const { playTrack } = usePlayer();

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Library</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="search" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="add" size={26} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {activeTab === 'Playlists' && <PlaylistsTab />}
      {activeTab === 'Albums' && <AlbumsTab />}
      {activeTab === 'Artists' && <ArtistsTab />}
      {activeTab === 'Songs' && <SongsTab />}
    </View>
  );
}

function PlaylistsTab() {
  const { playTrack } = usePlayer();
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.playlistGrid}>
        {PLAYLISTS.map(pl => (
          <TouchableOpacity
            key={pl.id}
            style={styles.playlistCard}
            onPress={() => playTrack(pl.tracks[0], pl.tracks)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: pl.artwork }} style={styles.playlistArt} />
            <Text style={styles.playlistTitle} numberOfLines={2}>{pl.title}</Text>
            <Text style={styles.playlistMeta} numberOfLines={1}>{pl.tracks.length} songs</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function AlbumsTab() {
  const { playTrack } = usePlayer();
  return (
    <FlatList
      data={ALBUMS}
      keyExtractor={i => i.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.albumGrid}
      columnWrapperStyle={{ gap: 12 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.albumGridItem}
          onPress={() => playTrack(item.tracks[0], item.tracks)}
          activeOpacity={0.8}
        >
          <Image source={{ uri: item.artwork }} style={styles.albumGridArt} />
          <Text style={styles.albumGridTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.albumGridArtist} numberOfLines={1}>{item.artist} · {item.year}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

function ArtistsTab() {
  return (
    <FlatList
      data={ARTISTS}
      keyExtractor={i => i.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.artistRow} activeOpacity={0.7}>
          <Image source={{ uri: item.image }} style={styles.artistImage} />
          <View style={styles.artistInfo}>
            <Text style={styles.artistName}>{item.name}</Text>
            <Text style={styles.artistMeta}>{item.genre} · {item.followers} followers</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}
    />
  );
}

function SongsTab() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.sortRow}>
        <Ionicons name="filter" size={14} color={Colors.primary} />
        <Text style={styles.sortText}>Title</Text>
      </View>
      {TRACKS.map((track, idx) => (
        <TrackItem key={track.id} track={track} queue={TRACKS} showIndex={idx} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    padding: 4,
  },
  tabs: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  // Playlists
  playlistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  playlistCard: {
    width: '45%',
  },
  playlistArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    marginBottom: 8,
  },
  playlistTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  playlistMeta: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  // Albums
  albumGrid: {
    padding: 16,
    paddingBottom: 120,
  },
  albumGridItem: {
    flex: 1,
  },
  albumGridArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    marginBottom: 8,
  },
  albumGridTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  albumGridArtist: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  // Artists
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  artistImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceSecondary,
  },
  artistInfo: {
    flex: 1,
    marginLeft: 14,
  },
  artistName: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 3,
  },
  artistMeta: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  // Songs
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  sortText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});
