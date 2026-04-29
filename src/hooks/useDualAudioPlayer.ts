import { useCallback, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { MusicTrack, AmbienceTrack } from '@/src/engine/types';
import { AUDIO_ASSETS } from '@/src/data/music';

interface DualAudioState {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setMusicVolume: (v: number) => void;
  setAmbienceVolume: (v: number) => void;
}

function resetPlayer(player: AudioPlayer) {
  try {
    player.pause();
  } catch {}

  try {
    player.seekTo(0).catch(() => {});
  } catch {}
}

function resolveAudioSource(track: MusicTrack | AmbienceTrack | null) {
  if (!track) return null;
  const remoteUrl = (track as MusicTrack & { remoteUrl?: string }).remoteUrl;
  if (remoteUrl) return { uri: remoteUrl };
  return AUDIO_ASSETS[track.filename] ?? null;
}

/**
 * Dual audio player hook — manages two concurrent audio instances
 * (one for music, one for ambient sounds) using expo-audio.
 *
 * Audio files are loaded from AUDIO_ASSETS using the track's filename.
 * If an asset is missing, the player receives null and becomes a no-op.
 */
export function useDualAudioPlayer(
  music: MusicTrack | null,
  ambience: AmbienceTrack | null,
): DualAudioState {
  // Resolve audio sources (returns require() asset or null)
  const musicSource = resolveAudioSource(music);
  const ambienceSource = resolveAudioSource(ambience);

  // Always call hooks unconditionally (React rules)
  const musicPlayer = useAudioPlayer(musicSource);
  const ambiencePlayer = useAudioPlayer(ambienceSource);

  // Configure players when they change (guard: may throw if no source loaded)
  useEffect(() => {
    try {
      musicPlayer.loop = true;
      musicPlayer.volume = 0.5;
    } catch {}
  }, [musicPlayer]);

  useEffect(() => {
    try {
      ambiencePlayer.loop = true;
      ambiencePlayer.volume = 0.5;
    } catch {}
  }, [ambiencePlayer]);

  const play = useCallback(() => {
    try { musicPlayer.play(); } catch {}
    try { ambiencePlayer.play(); } catch {}
  }, [musicPlayer, ambiencePlayer]);

  const pause = useCallback(() => {
    try { musicPlayer.pause(); } catch {}
    try { ambiencePlayer.pause(); } catch {}
  }, [musicPlayer, ambiencePlayer]);

  const stop = useCallback(() => {
    resetPlayer(musicPlayer);
    resetPlayer(ambiencePlayer);
  }, [musicPlayer, ambiencePlayer]);

  const setMusicVolume = useCallback((v: number) => {
    try { musicPlayer.volume = Math.max(0, Math.min(1, v)); } catch {}
  }, [musicPlayer]);

  const setAmbienceVolume = useCallback((v: number) => {
    try { ambiencePlayer.volume = Math.max(0, Math.min(1, v)); } catch {}
  }, [ambiencePlayer]);

  return { play, pause, stop, setMusicVolume, setAmbienceVolume };
}
