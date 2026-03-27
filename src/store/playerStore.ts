import { create } from 'zustand';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Track, TRACKS } from '../data/mockData';

export type RepeatMode = 'none' | 'all' | 'one';

// 音频实例和加载标记放在模块级别（不触发 React 渲染）
let soundRef: Audio.Sound | null = null;
let isInitialLoad = false;

// 初始化音频模式（模块加载时执行一次）
Audio.setAudioModeAsync({
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
}).catch(() => {});

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  showNowPlaying: boolean;

  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (position: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setShowNowPlaying: (show: boolean) => void;
  addToQueue: (track: Track) => void;
}

export const usePlayer = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: TRACKS,
  queueIndex: 0,
  isPlaying: false,
  isLoading: false,
  duration: 0,
  position: 0,
  volume: 1,
  isShuffle: false,
  repeatMode: 'none',
  showNowPlaying: false,

  playTrack: async (track, queue) => {
    const newQueue = queue ?? get().queue;
    const newIndex = newQueue.findIndex(t => t.id === track.id);
    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: newIndex >= 0 ? newIndex : 0,
      showNowPlaying: true,
    });
    await loadAndPlay(track);
  },

  togglePlay: async () => {
    if (!soundRef) return;
    const wasPlaying = get().isPlaying;
    // 乐观更新：先改 UI，再调用音频 API
    set({ isPlaying: !wasPlaying });
    try {
      if (wasPlaying) {
        await soundRef.pauseAsync();
      } else {
        await soundRef.playAsync();
      }
    } catch {
      // 失败则回滚
      set({ isPlaying: wasPlaying });
    }
  },

  playNext: async () => {
    const { queue, queueIndex, isShuffle } = get();
    const nextIndex = isShuffle
      ? Math.floor(Math.random() * queue.length)
      : (queueIndex + 1) % queue.length;
    const nextTrack = queue[nextIndex];
    set({ currentTrack: nextTrack, queueIndex: nextIndex });
    await loadAndPlay(nextTrack);
  },

  playPrev: async () => {
    const { position, queueIndex, queue } = get();
    // 播放超过 3 秒时，点击上一首是回到头部
    if (position > 3) {
      try { await soundRef?.setPositionAsync(0); } catch {}
      return;
    }
    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    const prevTrack = queue[prevIndex];
    set({ currentTrack: prevTrack, queueIndex: prevIndex });
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

  toggleShuffle: () => set(state => ({ isShuffle: !state.isShuffle })),

  toggleRepeat: () => {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const idx = modes.indexOf(get().repeatMode);
    set({ repeatMode: modes[(idx + 1) % modes.length] });
  },

  setShowNowPlaying: (show) => set({ showNowPlaying: show }),

  addToQueue: (track) => set(state => ({ queue: [...state.queue, track] })),
}));

// 加载并播放音频（模块级函数，通过 usePlayer.getState() 读写 store）
async function loadAndPlay(track: Track) {
  try {
    if (soundRef) {
      await soundRef.unloadAsync();
      soundRef = null;
    }
    isInitialLoad = true;
    usePlayer.setState({ isLoading: true, position: 0 });

    const { sound } = await Audio.Sound.createAsync(
      { uri: track.audioUrl },
      {
        shouldPlay: true,
        volume: usePlayer.getState().volume,
        progressUpdateIntervalMillis: 500,
      },
      (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;

        const patch: Partial<PlayerStore> = {
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
          // 用 getState() 读最新状态，不存在闭包陈旧问题
          const { repeatMode, isShuffle, queueIndex, queue } = usePlayer.getState();
          if (repeatMode === 'one') {
            soundRef?.replayAsync();
          } else if (repeatMode === 'all' || queueIndex < queue.length - 1) {
            const nextIdx = isShuffle
              ? Math.floor(Math.random() * queue.length)
              : (queueIndex + 1) % queue.length;
            const nextTrack = queue[nextIdx];
            usePlayer.setState({ currentTrack: nextTrack, queueIndex: nextIdx });
            loadAndPlay(nextTrack);
          } else {
            usePlayer.setState({ isPlaying: false });
          }
        }
      }
    );

    soundRef = sound;
    usePlayer.setState({ isLoading: false, isPlaying: true });
    isInitialLoad = false;
  } catch (e) {
    console.log('Audio load error:', e);
    usePlayer.setState({ isLoading: false });
    isInitialLoad = false;
  }
}
