import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SearchScreen from '../app/(tabs)/search';
import { TRACKS } from '../src/data/mockData';
import { usePlayer } from '../src/store/playerStore';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('../src/store/playerStore', () => ({
  usePlayer: jest.fn(),
}));

describe('Search screen', () => {
  const mockPlayTrack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePlayer as unknown as jest.Mock).mockReturnValue({
      playTrack: mockPlayTrack,
    });
  });

  it('shows browse content by default', () => {
    const { getByText } = render(<SearchScreen />);
    expect(getByText('Browse Categories')).toBeTruthy();
  });

  it('filters tracks by query and shows results', () => {
    const { getByPlaceholderText, getByText } = render(<SearchScreen />);
    const input = getByPlaceholderText('Artists, Songs, Podcasts');

    fireEvent.changeText(input, TRACKS[0].title.slice(0, 6));

    expect(getByText(/Results/)).toBeTruthy();
    expect(getByText(TRACKS[0].title)).toBeTruthy();
  });

  it('shows empty state when query has no match', () => {
    const { getByPlaceholderText, getByText } = render(<SearchScreen />);
    const input = getByPlaceholderText('Artists, Songs, Podcasts');

    fireEvent.changeText(input, '__no_match_keyword__');

    expect(getByText('No Results Found')).toBeTruthy();
    expect(getByText('Try a different search')).toBeTruthy();
  });

  it('clears search when pressing Cancel', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<SearchScreen />);
    const input = getByPlaceholderText('Artists, Songs, Podcasts');

    fireEvent.changeText(input, '__no_match_keyword__');
    fireEvent.press(getByText('Cancel'));

    expect(getByText('Browse Categories')).toBeTruthy();
    expect(queryByText('No Results Found')).toBeNull();
  });
});
