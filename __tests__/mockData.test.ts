import {
  ALBUMS,
  PLAYLISTS,
  TRACKS,
  formatDuration,
} from '../src/data/mockData';

describe('mock data business rules', () => {
  it('formats track duration correctly', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(125)).toBe('2:05');
  });

  it('keeps every album track mapped to the global track list', () => {
    const trackIds = new Set(TRACKS.map((track) => track.id));

    for (const album of ALBUMS) {
      expect(album.tracks.length).toBeGreaterThan(0);
      for (const track of album.tracks) {
        expect(trackIds.has(track.id)).toBe(true);
      }
    }
  });

  it('keeps every playlist track mapped to the global track list', () => {
    const trackIds = new Set(TRACKS.map((track) => track.id));

    for (const playlist of PLAYLISTS) {
      expect(playlist.tracks.length).toBeGreaterThan(0);
      for (const track of playlist.tracks) {
        expect(trackIds.has(track.id)).toBe(true);
      }
    }
  });

  it('keeps required track fields valid', () => {
    for (const track of TRACKS) {
      expect(track.id).toBeTruthy();
      expect(track.title).toBeTruthy();
      expect(track.artist).toBeTruthy();
      expect(track.audioUrl).toBeTruthy();
      expect(track.artwork).toBeTruthy();
      expect(track.duration).toBeGreaterThan(0);
    }
  });
});
