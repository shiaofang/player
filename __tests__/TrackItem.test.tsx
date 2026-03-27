import React from 'react';
import { TouchableOpacity } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import TrackItem from '../src/components/TrackItem';
import { TRACKS } from '../src/data/mockData';
import { usePlayer } from '../src/store/playerStore';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('../src/store/playerStore', () => ({
  usePlayer: jest.fn(),
}));

describe('TrackItem component', () => {
  const mockPlayTrack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePlayer as unknown as jest.Mock).mockReturnValue({
      playTrack: mockPlayTrack,
      currentTrack: null,
      isPlaying: false,
    });
  });

  it('calls playTrack when pressing the row', () => {
    const queue = [TRACKS[0], TRACKS[1]];
    const { getByText } = render(
      <TrackItem track={TRACKS[0]} queue={queue} />
    );

    fireEvent.press(getByText(TRACKS[0].title));
    expect(mockPlayTrack).toHaveBeenCalledWith(TRACKS[0], queue);
  });

  it('calls onMorePress when pressing the more button', () => {
    const onMorePress = jest.fn();
    const screen = render(
      <TrackItem track={TRACKS[0]} queue={[TRACKS[0], TRACKS[1]]} onMorePress={onMorePress} />
    );
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);

    fireEvent.press(buttons[1]);
    expect(onMorePress).toHaveBeenCalledWith(TRACKS[0]);
  });

  it('shows index text when showIndex is provided and item is not active', () => {
    const { getByText } = render(
      <TrackItem track={TRACKS[0]} queue={TRACKS} showIndex={0} />
    );

    expect(getByText('1')).toBeTruthy();
  });

  it('hides index text and shows playing indicator when item is active and playing', () => {
    (usePlayer as unknown as jest.Mock).mockReturnValue({
      playTrack: mockPlayTrack,
      currentTrack: TRACKS[0],
      isPlaying: true,
    });

    const { queryByText } = render(
      <TrackItem track={TRACKS[0]} queue={TRACKS} showIndex={0} />
    );

    expect(queryByText('1')).toBeNull();
  });
});
