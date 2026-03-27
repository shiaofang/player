import React from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../src/theme/colors';
import { TRACKS, ALBUMS, PLAYLISTS, Track } from '../../src/data/mockData';
import AlbumCard from '../../src/components/AlbumCard';
import { usePlayer } from '../../src/store/playerStore';

const { width } = Dimensions.get('window');
const FEATURED_HEIGHT = 280;

export default function HomeScreen() {
    const { playTrack } = usePlayer();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <View style={styles.root}>
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.header}>
                        <Text style={styles.greeting}>{greeting}</Text>
                        <TouchableOpacity>
                            <Ionicons name="person-circle" size={32} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                <FeaturedBanner tracks={TRACKS.slice(0, 4)} onPlay={playTrack} />

                <Section title="Recently Played">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding}>
                        {TRACKS.slice(0, 6).map(item => (
                            <AlbumCard
                                key={item.id}
                                artwork={item.artwork}
                                title={item.title}
                                subtitle={item.artist}
                                size={130}
                                onPress={() => playTrack(item, TRACKS)}
                            />
                        ))}
                    </ScrollView>
                </Section>

                <Section title="New Releases">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding}>
                        {ALBUMS.map(item => (
                            <AlbumCard
                                key={item.id}
                                artwork={item.artwork}
                                title={item.title}
                                subtitle={item.artist}
                                size={150}
                                onPress={() => playTrack(item.tracks[0], item.tracks)}
                            />
                        ))}
                    </ScrollView>
                </Section>

                <Section title="Made For You">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding}>
                        {PLAYLISTS.map(item => (
                            <AlbumCard
                                key={item.id}
                                artwork={item.artwork}
                                title={item.title}
                                subtitle={item.curator || 'Playlist'}
                                size={160}
                                onPress={() => playTrack(item.tracks[0], item.tracks)}
                            />
                        ))}
                    </ScrollView>
                </Section>

                <Section title="Top Tracks">
                    {TRACKS.slice(0, 5).map((track, idx) => (
                        <TopTrackRow key={track.id} track={track} index={idx} onPlay={() => playTrack(track, TRACKS)} />
                    ))}
                </Section>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

function FeaturedBanner({ tracks, onPlay }: { tracks: Track[], onPlay: (t: Track, q: Track[]) => void }) {
    const track = tracks[0];
    return (
        <TouchableOpacity style={styles.featured} onPress={() => onPlay(track, tracks)} activeOpacity={0.95}>
            <Image source={{ uri: track.artwork }} style={styles.featuredImage} />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.featuredGradient}
            >
                <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>NEW RELEASE</Text>
                </View>
                <Text style={styles.featuredTitle}>{track.title}</Text>
                <Text style={styles.featuredArtist}>{track.artist}</Text>
                <View style={styles.featuredActions}>
                    <TouchableOpacity style={styles.playBtn} onPress={() => onPlay(track, tracks)}>
                        <Ionicons name="play-circle" size={16} color="#fff" />
                        <Text style={styles.playBtnText}>Play</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shuffleBtn} onPress={() => onPlay(tracks[Math.floor(Math.random() * tracks.length)], tracks)}>
                        <Text style={styles.shuffleBtnText}>Shuffle</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>
            {children}
        </View>
    );
}

function TopTrackRow({ track, index, onPlay }: { track: Track; index: number; onPlay: () => void }) {
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

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scroll: {
        flex: 1,
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
        height: FEATURED_HEIGHT,
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
    seeAll: {
        fontSize: 15,
        color: Colors.primary,
        fontWeight: '500',
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
