// @ts-nocheck
import { create } from 'zustand';
import { Audio } from 'expo-av';
import { TRACKS } from '../data/mockData';

let soundRef = null;
let isInitialLoad = false;

Audio.setAudioModeAsync({
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
}).catch(() => {});

export const usePlayer = create((set, get) => ({
  currentTrack: null,
  queue: TRACKS,
  queueIndex: 0,
  isPlaying: false,
  isLoading: false,
  playbackError: false,
  duration: 0,
  position: 0,
  volume: 1,
  isShuffle: false,
  repeatMode: 'none',   // 'none' | 'all' | 'one'
  showNowPlaying: false,

  playTrack: async (track, queue) => {
    const newQueue = queue ?? get().queue;
    const newIndex = newQueue.findIndex(t => t.id === track.id);
    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: newIndex >= 0 ? newIndex : 0,
      showNowPlaying: true,
      playbackError: false,
    });
    await loadAndPlay(track);
  },

  togglePlay: async () => {
    if (!soundRef) return;
    const wasPlaying = get().isPlaying;
    set({ isPlaying: !wasPlaying });
    try {
      if (wasPlaying) {
        await soundRef.pauseAsync();
      } else {
        await soundRef.playAsync();
      }
    } catch {
      set({ isPlaying: wasPlaying });
    }
  },

  playNext: async () => {
    const { queue, queueIndex, isShuffle } = get();
    const nextIndex = isShuffle
      ? Math.floor(Math.random() * queue.length)
      : (queueIndex + 1) % queue.length;
    const nextTrack = queue[nextIndex];
    set({ currentTrack: nextTrack, queueIndex: nextIndex, playbackError: false });
    await loadAndPlay(nextTrack);
  },

  playPrev: async () => {
    const { position, queueIndex, queue } = get();
    if (position > 3) {
      try { await soundRef?.setPositionAsync(0); } catch {}
      return;
    }
    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    const prevTrack = queue[prevIndex];
    set({ currentTrack: prevTrack, queueIndex: prevIndex, playbackError: false });
    await loadAndPlay(prevTrack);
  },

  seekTo: async (position) => {
    try { await soundRef?.setPositionAsync(position * 1000); } catch {}
    set({ position });
  },

  setVolume: async (volume) => {
    try { await soundRef?.setVolumeAsync(volume); } catch {}
    set({ volume });
  },

  toggleShuffle: () => set(s => ({ isShuffle: !s.isShuffle })),

  toggleRepeat: () => {
    const modes = ['none', 'all', 'one'];
    const idx = modes.indexOf(get().repeatMode);
    set({ repeatMode: modes[(idx + 1) % modes.length] });
  },

  setShowNowPlaying: (show) => set({ showNowPlaying: show }),

  addToQueue: (track) => set(s => ({ queue: [...s.queue, track] })),
}));

// ─── Core playback function ───────────────────────────────────────────────────

async function loadAndPlay(track) {
  try {
    if (soundRef) {
      await soundRef.unloadAsync();
      soundRef = null;
    }
    isInitialLoad = true;
    usePlayer.setState({ isLoading: true, position: 0, duration: 0, isPlaying: false });

    if (!track.audioUrl) {
      console.warn('[Player] No audio URL for:', track.title);
      usePlayer.setState({ isLoading: false, isPlaying: false, playbackError: true });
      isInitialLoad = false;
      return;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: track.audioUrl },
      {
        shouldPlay: true,
        volume: usePlayer.getState().volume,
        progressUpdateIntervalMillis: 500,
      },
      (status) => {
        if (!status.isLoaded) return;

        const patch = {
          isPlaying: status.isPlaying,
          position: status.positionMillis / 1000,
        };
        if (status.durationMillis) {
          patch.duration = status.durationMillis / 1000;
        }
        if (isInitialLoad && !status.isBuffering) {
          patch.isLoading = false;
          isInitialLoad = false;
        }
        usePlayer.setState(patch);

        if (status.didJustFinish) {
          const { duration } = usePlayer.getState();
          if (duration === 0) return;

          const { repeatMode, isShuffle, queueIndex, queue } = usePlayer.getState();
          if (repeatMode === 'one') {
            soundRef?.replayAsync();
          } else if (repeatMode === 'all' || queueIndex < queue.length - 1) {
            const nextIdx = isShuffle
              ? Math.floor(Math.random() * queue.length)
              : (queueIndex + 1) % queue.length;
            const nextTrack = queue[nextIdx];
            usePlayer.setState({ currentTrack: nextTrack, queueIndex: nextIdx, playbackError: false });
            loadAndPlay(nextTrack);
          } else {
            usePlayer.setState({ isPlaying: false });
          }
        }
      },
    );

    soundRef = sound;
    usePlayer.setState({ isLoading: false, isPlaying: true });
    isInitialLoad = false;
  } catch (e) {
    console.warn('[Player] Audio load error:', e);
    usePlayer.setState({ isLoading: false, isPlaying: false, playbackError: true });
    isInitialLoad = false;
  }
}

