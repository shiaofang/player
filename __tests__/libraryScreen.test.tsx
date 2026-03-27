import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import LibraryScreen from '../app/(tabs)/library';
import { ALBUMS, PLAYLISTS, TRACKS } from '../src/data/mockData';
import { usePlayer } from '../src/store/playerStore';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('../src/store/playerStore', () => ({
  usePlayer: jest.fn(),
}));

describe('Library screen', () => {
  const mockPlayTrack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePlayer as unknown as jest.Mock).mockReturnValue({
      playTrack: mockPlayTrack,
      currentTrack: null,
      isPlaying: false,
    });
  });

  it('renders playlists tab by default', () => {
    const { getByText } = render(<LibraryScreen />);
    expect(getByText('Library')).toBeTruthy();
    expect(getByText(PLAYLISTS[0].title)).toBeTruthy();
  });

  it('switches to Albums tab and renders album content', () => {
    const { getByText } = render(<LibraryScreen />);

    fireEvent.press(getByText('Albums'));
    expect(getByText(ALBUMS[0].title)).toBeTruthy();
  });

  it('switches to Artists tab and renders artist list', () => {
    const { getByText } = render(<LibraryScreen />);

    fireEvent.press(getByText('Artists'));
    expect(getByText('Luna Wave')).toBeTruthy();
  });

  it('switches to Songs tab and renders track rows', () => {
    const { getByText } = render(<LibraryScreen />);

    fireEvent.press(getByText('Songs'));
    expect(getByText('Title')).toBeTruthy();
    expect(getByText(TRACKS[0].title)).toBeTruthy();
  });

  it('plays playlist when pressing playlist card', () => {
    const { getByText } = render(<LibraryScreen />);
    fireEvent.press(getByText(PLAYLISTS[0].title));

    expect(mockPlayTrack).toHaveBeenCalledWith(
      PLAYLISTS[0].tracks[0],
      PLAYLISTS[0].tracks
    );
  });

  it('plays album when pressing album card', () => {
    const { getByText } = render(<LibraryScreen />);
    fireEvent.press(getByText('Albums'));
    fireEvent.press(getByText(ALBUMS[0].title));

    expect(mockPlayTrack).toHaveBeenCalledWith(
      ALBUMS[0].tracks[0],
      ALBUMS[0].tracks
    );
  });
});
