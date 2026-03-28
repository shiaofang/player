// @ts-nocheck
import http from './http';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toForm(params) {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

function toHttps(url = '') {
  return url.replace(/^http:\/\//, 'https://');
}

/** NetEase public audio URL - 302 redirects to the real CDN mp3. */
export function buildAudioUrl(id) {
  return `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
}

// ─── API ──────────────────────────────────────────────────────────────────────

/** Fetch a playlist and its tracks. */
export async function fetchPlaylist(id) {
  try {
    const { data } = await http.post('', toForm({ types: 'playlist', id: String(id) }));
    return data.playlist ?? null;
  } catch (e) {
    console.warn('[MusicAPI] fetchPlaylist error:', e);
    return null;
  }
}

/** Search songs by keyword. Returns track objects ready to play. */
export async function searchTracks(keyword, limit = 30) {
  try {
    const { data } = await http.post('', toForm({ types: 'search', s: keyword, limit }));
    const songs = data.result?.songs ?? data.songs ?? [];
    return songs.map(s => ({
      id: String(s.id),
      title: s.name,
      artist: s.artists?.map(a => a.name).join(' / ') ?? '',
      album: s.album?.name ?? '',
      artwork: toHttps(s.album?.picUrl ?? s.album?.blurPicUrl ?? ''),
      duration: Math.floor((s.duration ?? 0) / 1000),
      audioUrl: buildAudioUrl(s.id),
    }));
  } catch (e) {
    console.warn('[MusicAPI] searchTracks error:', e);
    return [];
  }
}

/** Convert a raw API track object to the app's track shape. */
export function apiTrackToTrack(t) {
  return {
    id: String(t.id),
    title: t.name,
    artist: t.ar.map(a => a.name).join(' / '),
    album: t.al.name,
    artwork: toHttps(t.al.picUrl),
    duration: Math.floor(t.dt / 1000),
    audioUrl: buildAudioUrl(t.id),
  };
}

