import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  StyleSheet, TouchableOpacity, Image, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../src/theme/colors';
import { TRACKS, ALBUMS, GENRES, Track } from '../../src/data/mockData';
import { usePlayer } from '../../src/store/playerStore';
import AlbumCard from '../../src/components/AlbumCard';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const { playTrack } = usePlayer();

  const results = query.length > 0
    ? TRACKS.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.artist.toLowerCase().includes(query.toLowerCase()) ||
      t.album.toLowerCase().includes(query.toLowerCase())
    )
    : [];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
        </View>
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Artists, Songs, Podcasts"
              placeholderTextColor={Colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              returnKeyType="search"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          {(focused || query.length > 0) && (
            <TouchableOpacity onPress={() => { setQuery(''); setFocused(false); Keyboard.dismiss(); }} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {query.length > 0 ? (
        <SearchResults results={results} onPlay={t => playTrack(t, results)} />
      ) : (
        <BrowseContent />
      )}
    </View>
  );
}

function SearchResults({ results, onPlay }: { results: Track[]; onPlay: (t: Track) => void }) {
  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="musical-notes" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No Results Found</Text>
        <Text style={styles.emptySubtext}>Try a different search</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.resultsLabel}>{results.length} Results</Text>
      {results.map(track => (
        <TouchableOpacity key={track.id} style={styles.resultRow} onPress={() => onPlay(track)} activeOpacity={0.7}>
          <Image source={{ uri: track.artwork }} style={styles.resultArt} />
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle} numberOfLines={1}>{track.title}</Text>
            <Text style={styles.resultSub} numberOfLines={1}>{track.artist} · {track.album}</Text>
          </View>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function BrowseContent() {
  const { playTrack } = usePlayer();
  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.browseTitle}>Browse Categories</Text>
      <View style={styles.genreGrid}>
        {GENRES.map(genre => (
          <TouchableOpacity
            key={genre.id}
            style={[styles.genreCard, { backgroundColor: genre.color }]}
            activeOpacity={0.85}
          >
            <Text style={styles.genreName}>{genre.name}</Text>
            <Ionicons name="musical-note" size={36} color="rgba(255,255,255,0.3)" style={styles.genreIcon} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.browseTitle, { marginTop: 24 }]}>Featured Albums</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {ALBUMS.map(item => (
          <AlbumCard
            key={item.id}
            artwork={item.artwork}
            title={item.title}
            subtitle={item.artist}
            size={140}
            onPress={() => playTrack(item.tracks[0], item.tracks)}
          />
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 0,
  },
  cancelBtn: {
    paddingHorizontal: 4,
  },
  cancelText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  resultsLabel: {
    fontSize: 14,
    color: Colors.textTertiary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultArt: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: Colors.surfaceSecondary,
  },
  resultInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  resultTitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  resultSub: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  browseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  genreCard: {
    width: '47%',
    height: 90,
    borderRadius: 12,
    padding: 14,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  genreName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  genreIcon: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    transform: [{ rotate: '20deg' }],
  },
});
