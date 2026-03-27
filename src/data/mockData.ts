export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  artwork: string;
  audioUrl: string;
  genre: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  year: number;
  tracks: Track[];
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  genre: string;
  followers: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  artwork: string;
  tracks: Track[];
  curator?: string;
}

const ARTWORK_BASE = 'https://picsum.photos/seed';

export const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Midnight Dreams',
    artist: 'Luna Wave',
    album: 'Neon Horizons',
    duration: 213,
    artwork: `${ARTWORK_BASE}/music1/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    genre: 'Electronic',
  },
  {
    id: '2',
    title: 'Golden Hour',
    artist: 'Solar Drift',
    album: 'Sunsets & Echoes',
    duration: 187,
    artwork: `${ARTWORK_BASE}/music2/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    genre: 'Indie Pop',
  },
  {
    id: '3',
    title: 'Ocean Pulse',
    artist: 'Deep Current',
    album: 'Tidal Forces',
    duration: 245,
    artwork: `${ARTWORK_BASE}/music3/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    genre: 'Ambient',
  },
  {
    id: '4',
    title: 'City Lights',
    artist: 'Urban Echo',
    album: 'Metropolitan',
    duration: 198,
    artwork: `${ARTWORK_BASE}/music4/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    genre: 'R&B',
  },
  {
    id: '5',
    title: 'Starfall',
    artist: 'Cosmic Tide',
    album: 'Infinite Space',
    duration: 267,
    artwork: `${ARTWORK_BASE}/music5/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    genre: 'Electronic',
  },
  {
    id: '6',
    title: 'Forest Walk',
    artist: 'Nature Speaks',
    album: 'Green Canopy',
    duration: 224,
    artwork: `${ARTWORK_BASE}/music6/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    genre: 'Acoustic',
  },
  {
    id: '7',
    title: 'Neon Rain',
    artist: 'Synth Rider',
    album: 'Retrowave City',
    duration: 232,
    artwork: `${ARTWORK_BASE}/music7/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    genre: 'Synthwave',
  },
  {
    id: '8',
    title: 'Red Velvet',
    artist: 'Smooth Jazz Trio',
    album: 'Late Night Sessions',
    duration: 289,
    artwork: `${ARTWORK_BASE}/music8/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    genre: 'Jazz',
  },
  {
    id: '9',
    title: 'Running Wild',
    artist: 'Electric Storm',
    album: 'Power Surge',
    duration: 201,
    artwork: `${ARTWORK_BASE}/music9/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    genre: 'Rock',
  },
  {
    id: '10',
    title: 'Whisper in the Dark',
    artist: 'Night Owl',
    album: 'After Midnight',
    duration: 253,
    artwork: `${ARTWORK_BASE}/music10/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    genre: 'Alternative',
  },
  {
    id: '11',
    title: 'Summer Breeze',
    artist: 'Chill Coast',
    album: 'Beachside Vibes',
    duration: 178,
    artwork: `${ARTWORK_BASE}/music11/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    genre: 'Lo-Fi',
  },
  {
    id: '12',
    title: 'Thunder Road',
    artist: 'Highway Kings',
    album: 'Open Road',
    duration: 312,
    artwork: `${ARTWORK_BASE}/music12/400/400`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    genre: 'Country Rock',
  },
];

export const ALBUMS: Album[] = [
  {
    id: 'a1',
    title: 'Neon Horizons',
    artist: 'Luna Wave',
    artwork: `${ARTWORK_BASE}/album1/400/400`,
    year: 2024,
    tracks: [TRACKS[0], TRACKS[4], TRACKS[6]],
  },
  {
    id: 'a2',
    title: 'Sunsets & Echoes',
    artist: 'Solar Drift',
    artwork: `${ARTWORK_BASE}/album2/400/400`,
    year: 2024,
    tracks: [TRACKS[1], TRACKS[5], TRACKS[10]],
  },
  {
    id: 'a3',
    title: 'Tidal Forces',
    artist: 'Deep Current',
    artwork: `${ARTWORK_BASE}/album3/400/400`,
    year: 2023,
    tracks: [TRACKS[2], TRACKS[7], TRACKS[9]],
  },
  {
    id: 'a4',
    title: 'Metropolitan',
    artist: 'Urban Echo',
    artwork: `${ARTWORK_BASE}/album4/400/400`,
    year: 2023,
    tracks: [TRACKS[3], TRACKS[8], TRACKS[11]],
  },
  {
    id: 'a5',
    title: 'Infinite Space',
    artist: 'Cosmic Tide',
    artwork: `${ARTWORK_BASE}/album5/400/400`,
    year: 2025,
    tracks: [TRACKS[4], TRACKS[0], TRACKS[6]],
  },
  {
    id: 'a6',
    title: 'Retrowave City',
    artist: 'Synth Rider',
    artwork: `${ARTWORK_BASE}/album6/400/400`,
    year: 2025,
    tracks: [TRACKS[6], TRACKS[1], TRACKS[3]],
  },
];

export const ARTISTS: Artist[] = [
  { id: 'ar1', name: 'Luna Wave', image: `${ARTWORK_BASE}/artist1/300/300`, genre: 'Electronic', followers: '2.4M' },
  { id: 'ar2', name: 'Solar Drift', image: `${ARTWORK_BASE}/artist2/300/300`, genre: 'Indie Pop', followers: '1.8M' },
  { id: 'ar3', name: 'Deep Current', image: `${ARTWORK_BASE}/artist3/300/300`, genre: 'Ambient', followers: '892K' },
  { id: 'ar4', name: 'Urban Echo', image: `${ARTWORK_BASE}/artist4/300/300`, genre: 'R&B', followers: '3.1M' },
  { id: 'ar5', name: 'Cosmic Tide', image: `${ARTWORK_BASE}/artist5/300/300`, genre: 'Electronic', followers: '1.2M' },
  { id: 'ar6', name: 'Synth Rider', image: `${ARTWORK_BASE}/artist6/300/300`, genre: 'Synthwave', followers: '754K' },
];

export const PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    title: 'Chill Vibes',
    description: 'Perfect for winding down',
    artwork: `${ARTWORK_BASE}/playlist1/400/400`,
    tracks: [TRACKS[2], TRACKS[5], TRACKS[7], TRACKS[10]],
    curator: 'Apple Music',
  },
  {
    id: 'p2',
    title: 'Night Drive',
    description: 'Late night road trip essentials',
    artwork: `${ARTWORK_BASE}/playlist2/400/400`,
    tracks: [TRACKS[0], TRACKS[6], TRACKS[9], TRACKS[1]],
    curator: 'Apple Music',
  },
  {
    id: 'p3',
    title: 'Workout Mix',
    description: 'High energy beats to keep you moving',
    artwork: `${ARTWORK_BASE}/playlist3/400/400`,
    tracks: [TRACKS[8], TRACKS[4], TRACKS[3], TRACKS[11]],
    curator: 'Apple Music',
  },
  {
    id: 'p4',
    title: 'My Favorites',
    description: 'Songs you love',
    artwork: `${ARTWORK_BASE}/playlist4/400/400`,
    tracks: [TRACKS[0], TRACKS[3], TRACKS[7], TRACKS[11]],
  },
];

export const GENRES = [
  { id: 'g1', name: 'Electronic', color: '#FC3C44' },
  { id: 'g2', name: 'Indie Pop', color: '#007AFF' },
  { id: 'g3', name: 'R&B', color: '#30D158' },
  { id: 'g4', name: 'Jazz', color: '#FF9F0A' },
  { id: 'g5', name: 'Rock', color: '#BF5AF2' },
  { id: 'g6', name: 'Ambient', color: '#32ADE6' },
  { id: 'g7', name: 'Synthwave', color: '#FF375F' },
  { id: 'g8', name: 'Lo-Fi', color: '#34C759' },
  { id: 'g9', name: 'Acoustic', color: '#FF6B00' },
  { id: 'g10', name: 'Country Rock', color: '#AC8E68' },
];

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
