// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView,
  StyleSheet, TouchableOpacity, Image, Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../src/theme/colors';
import { GENRES } from '../../src/data/mockData';
import { searchTracks } from '../../src/services/musicApi';
import { usePlayer } from '../../src/store/playerStore';
import AlbumCard from '../../src/components/AlbumCard';

const DEBOUNCE_MS = 500;

const BROWSE_PLAYLISTS = [
  { id: '440103454',  title: '经典怀旧', desc: '老歌里的深情往事', color: '#FC3C44' },
  { id: '2619366284', title: '飙升榜',   desc: '最新最热流行单曲', color: '#007AFF' },
  { id: '3778678',    title: '华语流行', desc: '精选华语流行歌曲', color: '#30D158' },
  { id: '5059664837', title: '私人雷达', desc: '专属你的音乐发现', color: '#FF9F0A' },
];

const HOT_SEARCHES = [
  '周杰伦', '五月天', '陈奕迅', '邓紫棋', '林俊杰',
  '薛之谦', '李荣浩', '毛不易', '刘若英', '孙燕姿',
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const { playTrack } = usePlayer();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const data = await searchTracks(query);
      setResults(data);
      setSearching(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>搜索</Text>
        </View>
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索歌曲、歌手、专辑"
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
            <TouchableOpacity
              onPress={() => { setQuery(''); setFocused(false); Keyboard.dismiss(); }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {query.length > 0 ? (
        <SearchResults results={results} loading={searching} onPlay={t => playTrack(t, results)} />
      ) : (
        <BrowseContent />
      )}
    </View>
  );
}

// ─── Search Results ───────────────────────────────────────────────────────────

function SearchResults({ results, loading, onPlay }) {
  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingText}>搜索中…</Text>
      </View>
    );
  }
  if (results.length === 0) {
    return (
      <View style={styles.centerState}>
        <Ionicons name="musical-notes" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyText}>没有找到相关歌曲</Text>
        <Text style={styles.emptySubtext}>换个关键词试试吧</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.resultsLabel}>{results.length} 首结果</Text>
      {results.map(track => (
        <TouchableOpacity key={track.id} style={styles.resultRow} onPress={() => onPlay(track)} activeOpacity={0.7}>
          <Image source={{ uri: track.artwork }} style={styles.resultArt} />
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle} numberOfLines={1}>{track.title}</Text>
            <Text style={styles.resultSub} numberOfLines={1}>
              {track.artist}{track.album ? ` · ${track.album}` : ''}
            </Text>
          </View>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ─── Browse Content ───────────────────────────────────────────────────────────

function BrowseContent() {
  const { playTrack } = usePlayer();
  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

      <Text style={styles.browseTitle}>猜你喜欢</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {BROWSE_PLAYLISTS.map(p => (
          <AlbumCard
            key={p.id}
            artwork={`https://p2.music.126.net/pNOfp1IolNHRIJOJIEoP6A==/18624842393887661.jpg`}
            title={p.title}
            subtitle={p.desc}
            size={150}
            onPress={() => {}}
            style={undefined}
          />
        ))}
      </ScrollView>

      <Text style={[styles.browseTitle, { marginTop: 28 }]}>浏览分类</Text>
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

      <Text style={[styles.browseTitle, { marginTop: 28 }]}>热门搜索</Text>
      <View style={styles.hotTagsRow}>
        {HOT_SEARCHES.map(tag => (
          <TouchableOpacity key={tag} style={styles.hotTag}>
            <Text style={styles.hotTagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  loadingText: {
    color: Colors.textTertiary,
    marginTop: 12,
    fontSize: 15,
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
  hotTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  hotTag: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hotTagText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
});
