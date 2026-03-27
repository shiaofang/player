import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Track, TRACKS } from '../data/mockData';

export type RepeatMode = 'none' | 'all' | 'one';

interface PlayerState {
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
}

interface PlayerContextType extends PlayerState {
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

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const stateRef = useRef<PlayerState>({
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
  });

  const [state, setStateRaw] = useState<PlayerState>(stateRef.current);

  const setState = useCallback((updater: Partial<PlayerState> | ((prev: PlayerState) => Partial<PlayerState>)) => {
    setStateRaw(prev => {
      const patch = typeof updater === 'function' ? updater(prev) : updater;
      const next = { ...prev, ...patch };
      stateRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    }).catch(() => {});
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const loadAndPlay = useCallback(async (track: Track) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setState({ isLoading: true, position: 0 });

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: true, volume: stateRef.current.volume },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          setState({
            isPlaying: status.isPlaying,
            duration: status.durationMillis ? status.durationMillis / 1000 : stateRef.current.duration,
            position: status.positionMillis / 1000,
            isLoading: status.isBuffering,
          });
          if (status.didJustFinish) {
            const { repeatMode, isShuffle, queueIndex, queue } = stateRef.current;
            if (repeatMode === 'one') {
              soundRef.current?.replayAsync();
            } else if (repeatMode === 'all' || queueIndex < queue.length - 1) {
              const nextIdx = isShuffle
                ? Math.floor(Math.random() * queue.length)
                : (queueIndex + 1) % queue.length;
              const nextTrack = queue[nextIdx];
              setState({ currentTrack: nextTrack, queueIndex: nextIdx });
              loadAndPlay(nextTrack);
            } else {
              setState({ isPlaying: false });
            }
          }
        }
      );
      soundRef.current = sound;
      setState({ isLoading: false, isPlaying: true });
    } catch (e) {
      console.log('Audio load error:', e);
      setState({ isLoading: false });
    }
  }, [setState]);

  const playTrack = useCallback(async (track: Track, queue?: Track[]) => {
    const newQueue = queue ?? stateRef.current.queue;
    const newIndex = newQueue.findIndex(t => t.id === track.id);
    setState({
      currentTrack: track,
      queue: newQueue,
      queueIndex: newIndex >= 0 ? newIndex : 0,
      showNowPlaying: true,
    });
    await loadAndPlay(track);
  }, [loadAndPlay, setState]);

  const togglePlay = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      if (stateRef.current.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch {}
  }, []);

  const playNext = useCallback(async () => {
    const { queue, queueIndex, isShuffle } = stateRef.current;
    const nextIndex = isShuffle
      ? Math.floor(Math.random() * queue.length)
      : (queueIndex + 1) % queue.length;
    const nextTrack = queue[nextIndex];
    setState({ currentTrack: nextTrack, queueIndex: nextIndex });
    await loadAndPlay(nextTrack);
  }, [loadAndPlay, setState]);

  const playPrev = useCallback(async () => {
    const { position, queueIndex, queue } = stateRef.current;
    if (position > 3) {
      try { await soundRef.current?.setPositionAsync(0); } catch {}
      return;
    }
    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    const prevTrack = queue[prevIndex];
    setState({ currentTrack: prevTrack, queueIndex: prevIndex });
    await loadAndPlay(prevTrack);
  }, [loadAndPlay, setState]);

  const seekTo = useCallback(async (position: number) => {
    try { await soundRef.current?.setPositionAsync(position * 1000); } catch {}
    setState({ position });
  }, [setState]);

  const setVolume = useCallback(async (volume: number) => {
    try { await soundRef.current?.setVolumeAsync(volume); } catch {}
    setState({ volume });
  }, [setState]);

  const toggleShuffle = useCallback(() => {
    setState({ isShuffle: !stateRef.current.isShuffle });
  }, [setState]);

  const toggleRepeat = useCallback(() => {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const idx = modes.indexOf(stateRef.current.repeatMode);
    setState({ repeatMode: modes[(idx + 1) % modes.length] });
  }, [setState]);

  const setShowNowPlaying = useCallback((show: boolean) => {
    setState({ showNowPlaying: show });
  }, [setState]);

  const addToQueue = useCallback((track: Track) => {
    setState({ queue: [...stateRef.current.queue, track] });
  }, [setState]);

  return (
    <PlayerContext.Provider value={{
      ...state,
      playTrack,
      togglePlay,
      playNext,
      playPrev,
      seekTo,
      setVolume,
      toggleShuffle,
      toggleRepeat,
      setShowNowPlaying,
      addToQueue,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
}
