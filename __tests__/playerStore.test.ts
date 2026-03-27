import { TRACKS } from '../src/data/mockData';

const mockSetAudioModeAsync = jest.fn().mockResolvedValue(undefined);
const mockCreateAsync = jest.fn();
const mockSound = {
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  pauseAsync: jest.fn().mockResolvedValue(undefined),
  playAsync: jest.fn().mockResolvedValue(undefined),
  setPositionAsync: jest.fn().mockResolvedValue(undefined),
  setVolumeAsync: jest.fn().mockResolvedValue(undefined),
  replayAsync: jest.fn().mockResolvedValue(undefined),
};

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: mockSetAudioModeAsync,
    Sound: {
      createAsync: mockCreateAsync,
    },
  },
}));

describe('playerStore core behavior', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockSetAudioModeAsync.mockResolvedValue(undefined);
    mockCreateAsync.mockResolvedValue({ sound: mockSound });
  });

  function getFreshStore() {
    const { usePlayer } = require('../src/store/playerStore');
    return usePlayer as typeof import('../src/store/playerStore').usePlayer;
  }

  it('starts with expected defaults', () => {
    const usePlayer = getFreshStore();
    const state = usePlayer.getState();

    expect(state.currentTrack).toBeNull();
    expect(state.queue.length).toBeGreaterThan(0);
    expect(state.isPlaying).toBe(false);
    expect(state.repeatMode).toBe('none');
    expect(state.isShuffle).toBe(false);
  });

  it('cycles repeat mode in order', () => {
    const usePlayer = getFreshStore();

    usePlayer.getState().toggleRepeat();
    expect(usePlayer.getState().repeatMode).toBe('all');

    usePlayer.getState().toggleRepeat();
    expect(usePlayer.getState().repeatMode).toBe('one');

    usePlayer.getState().toggleRepeat();
    expect(usePlayer.getState().repeatMode).toBe('none');
  });

  it('toggles shuffle mode', () => {
    const usePlayer = getFreshStore();

    usePlayer.getState().toggleShuffle();
    expect(usePlayer.getState().isShuffle).toBe(true);

    usePlayer.getState().toggleShuffle();
    expect(usePlayer.getState().isShuffle).toBe(false);
  });

  it('adds track into queue tail', () => {
    const usePlayer = getFreshStore();
    const before = usePlayer.getState().queue.length;

    usePlayer.getState().addToQueue(TRACKS[0]);

    const afterQueue = usePlayer.getState().queue;
    expect(afterQueue.length).toBe(before + 1);
    expect(afterQueue[afterQueue.length - 1].id).toBe(TRACKS[0].id);
  });

  it('playTrack updates state and loads audio', async () => {
    const usePlayer = getFreshStore();
    const queue = [TRACKS[0], TRACKS[1], TRACKS[2]];

    await usePlayer.getState().playTrack(TRACKS[1], queue);

    const state = usePlayer.getState();
    expect(state.currentTrack?.id).toBe(TRACKS[1].id);
    expect(state.queueIndex).toBe(1);
    expect(state.showNowPlaying).toBe(true);
    expect(mockCreateAsync).toHaveBeenCalledTimes(1);
    expect(mockCreateAsync).toHaveBeenCalledWith(
      { uri: TRACKS[1].audioUrl },
      expect.objectContaining({
        shouldPlay: true,
        progressUpdateIntervalMillis: 500,
      }),
      expect.any(Function)
    );
  });

  it('togglePlay pauses when currently playing', async () => {
    const usePlayer = getFreshStore();

    await usePlayer.getState().playTrack(TRACKS[0], [TRACKS[0], TRACKS[1]]);
    expect(usePlayer.getState().isPlaying).toBe(true);

    await usePlayer.getState().togglePlay();

    expect(mockSound.pauseAsync).toHaveBeenCalledTimes(1);
    expect(usePlayer.getState().isPlaying).toBe(false);
  });

  it('seekTo updates position and calls sound API in millis', async () => {
    const usePlayer = getFreshStore();
    await usePlayer.getState().playTrack(TRACKS[0], [TRACKS[0], TRACKS[1]]);

    await usePlayer.getState().seekTo(42);

    expect(mockSound.setPositionAsync).toHaveBeenCalledWith(42000);
    expect(usePlayer.getState().position).toBe(42);
  });

  it('setVolume updates state and calls sound API', async () => {
    const usePlayer = getFreshStore();
    await usePlayer.getState().playTrack(TRACKS[0], [TRACKS[0], TRACKS[1]]);

    await usePlayer.getState().setVolume(0.35);

    expect(mockSound.setVolumeAsync).toHaveBeenCalledWith(0.35);
    expect(usePlayer.getState().volume).toBe(0.35);
  });

  it('playNext moves queue index forward in non-shuffle mode', async () => {
    const usePlayer = getFreshStore();
    const queue = [TRACKS[0], TRACKS[1], TRACKS[2]];

    await usePlayer.getState().playTrack(queue[0], queue);
    await usePlayer.getState().playNext();

    const state = usePlayer.getState();
    expect(state.queueIndex).toBe(1);
    expect(state.currentTrack?.id).toBe(queue[1].id);
  });

  it('playNext uses random index in shuffle mode', async () => {
    const usePlayer = getFreshStore();
    const queue = [TRACKS[0], TRACKS[1], TRACKS[2]];
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.9);

    await usePlayer.getState().playTrack(queue[0], queue);
    usePlayer.getState().toggleShuffle();
    await usePlayer.getState().playNext();

    expect(usePlayer.getState().queueIndex).toBe(2);
    expect(usePlayer.getState().currentTrack?.id).toBe(queue[2].id);
    randomSpy.mockRestore();
  });

  it('playPrev seeks to start when current position is over 3 seconds', async () => {
    const usePlayer = getFreshStore();
    const queue = [TRACKS[0], TRACKS[1], TRACKS[2]];

    await usePlayer.getState().playTrack(queue[1], queue);
    usePlayer.setState({ position: 10, queueIndex: 1, currentTrack: queue[1] });
    await usePlayer.getState().playPrev();

    expect(mockSound.setPositionAsync).toHaveBeenCalledWith(0);
    expect(usePlayer.getState().queueIndex).toBe(1);
    expect(usePlayer.getState().currentTrack?.id).toBe(queue[1].id);
  });

  it('playPrev wraps to queue tail when at the first item', async () => {
    const usePlayer = getFreshStore();
    const queue = [TRACKS[0], TRACKS[1], TRACKS[2]];

    await usePlayer.getState().playTrack(queue[0], queue);
    usePlayer.setState({ position: 1, queueIndex: 0, currentTrack: queue[0] });
    await usePlayer.getState().playPrev();

    expect(usePlayer.getState().queueIndex).toBe(2);
    expect(usePlayer.getState().currentTrack?.id).toBe(queue[2].id);
  });

  it('rolls back optimistic state when togglePlay fails', async () => {
    const usePlayer = getFreshStore();
    await usePlayer.getState().playTrack(TRACKS[0], [TRACKS[0], TRACKS[1]]);
    mockSound.pauseAsync.mockRejectedValueOnce(new Error('pause failed'));

    await usePlayer.getState().togglePlay();

    expect(usePlayer.getState().isPlaying).toBe(true);
  });

  it('falls back queueIndex to 0 when track is not inside provided queue', async () => {
    const usePlayer = getFreshStore();
    const queue = [TRACKS[0], TRACKS[1]];
    const missingTrack = { ...TRACKS[2], id: 'missing-track-id' };

    await usePlayer.getState().playTrack(missingTrack, queue);

    expect(usePlayer.getState().queueIndex).toBe(0);
    expect(usePlayer.getState().currentTrack?.id).toBe('missing-track-id');
  });

  it('sets showNowPlaying directly through action', () => {
    const usePlayer = getFreshStore();

    usePlayer.getState().setShowNowPlaying(true);
    expect(usePlayer.getState().showNowPlaying).toBe(true);

    usePlayer.getState().setShowNowPlaying(false);
    expect(usePlayer.getState().showNowPlaying).toBe(false);
  });

  it('updates state by playback status callback', async () => {
    const usePlayer = getFreshStore();
    await usePlayer.getState().playTrack(TRACKS[0], [TRACKS[0], TRACKS[1]]);
    const statusCallback = mockCreateAsync.mock.calls[0][2];

    statusCallback({
      isLoaded: true,
      isPlaying: true,
      isBuffering: false,
      positionMillis: 24000,
      durationMillis: 180000,
      didJustFinish: false,
    });

    const state = usePlayer.getState();
    expect(state.position).toBe(24);
    expect(state.duration).toBe(180);
    expect(state.isPlaying).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('replays same track when repeat mode is one and track finishes', async () => {
    const usePlayer = getFreshStore();
    await usePlayer.getState().playTrack(TRACKS[0], [TRACKS[0], TRACKS[1]]);
    usePlayer.setState({ repeatMode: 'one' });
    const statusCallback = mockCreateAsync.mock.calls[0][2];

    statusCallback({
      isLoaded: true,
      isPlaying: false,
      isBuffering: false,
      positionMillis: 180000,
      durationMillis: 180000,
      didJustFinish: true,
    });

    expect(mockSound.replayAsync).toHaveBeenCalledTimes(1);
  });

  it('advances to next track when repeat mode is all and track finishes', async () => {
    const usePlayer = getFreshStore();
    const queue = [TRACKS[0], TRACKS[1], TRACKS[2]];
    await usePlayer.getState().playTrack(queue[0], queue);
    usePlayer.setState({ repeatMode: 'all', queue, queueIndex: 0 });
    const statusCallback = mockCreateAsync.mock.calls[0][2];

    statusCallback({
      isLoaded: true,
      isPlaying: false,
      isBuffering: false,
      positionMillis: 1000,
      durationMillis: 1000,
      didJustFinish: true,
    });
    await Promise.resolve();

    expect(usePlayer.getState().currentTrack?.id).toBe(queue[1].id);
  });

  it('stops playback when non-repeat mode reaches queue end', async () => {
    const usePlayer = getFreshStore();
    const queue = [TRACKS[0], TRACKS[1]];
    await usePlayer.getState().playTrack(queue[1], queue);
    usePlayer.setState({ repeatMode: 'none', queue, queueIndex: 1, isPlaying: true });
    const statusCallback = mockCreateAsync.mock.calls[0][2];

    statusCallback({
      isLoaded: true,
      isPlaying: false,
      isBuffering: false,
      positionMillis: 1000,
      durationMillis: 1000,
      didJustFinish: true,
    });

    expect(usePlayer.getState().isPlaying).toBe(false);
  });
});
