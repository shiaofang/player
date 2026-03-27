import { TRACKS, ALBUMS, PLAYLISTS } from '../src/data/mockData';

describe('project smoke tests', () => {
  it('has mock data loaded', () => {
    expect(TRACKS.length).toBeGreaterThan(0);
    expect(ALBUMS.length).toBeGreaterThan(0);
    expect(PLAYLISTS.length).toBeGreaterThan(0);
  });
});
