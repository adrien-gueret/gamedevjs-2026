import { getCurrentPathname } from "@/services/selector";

import {
  isAudioEnabled,
  onAudioEnabledChange,
  setAudioEnabled as setGlobalAudioEnabled,
} from "./audio";

export type BackgroundMusicTrack = "title" | "battle" | "shop" | "gameover";

const BACKGROUND_MUSIC_VOLUME = 0.1;

const trackToAudioId: Record<BackgroundMusicTrack, string> = {
  title: "audio-title",
  battle: "audio-battle",
  shop: "audio-shop",
  gameover: "audio-gameover",
};

let currentTrack: BackgroundMusicTrack | null = null;

function getAudio(track: BackgroundMusicTrack): HTMLAudioElement | null {
  const audio = document.getElementById(trackToAudioId[track]);

  if (audio instanceof HTMLAudioElement) {
    audio.volume = BACKGROUND_MUSIC_VOLUME;
    return audio;
  }

  return null;
}

export function stopBackgroundMusic(): void {
  (Object.keys(trackToAudioId) as BackgroundMusicTrack[]).forEach((track) => {
    const audio = getAudio(track);

    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
  });

  currentTrack = null;
}

export function playBackgroundMusic(track: BackgroundMusicTrack): void {
  if (currentTrack === track) {
    return;
  }

  (Object.keys(trackToAudioId) as BackgroundMusicTrack[]).forEach(
    (otherTrack) => {
      const audio = getAudio(otherTrack);

      if (!audio) {
        return;
      }

      if (otherTrack !== track) {
        audio.pause();
        audio.currentTime = 0;
      }
    },
  );

  const activeAudio = getAudio(track);

  if (!activeAudio) {
    return;
  }

  currentTrack = track;

  if (!isAudioEnabled()) {
    return;
  }

  void activeAudio.play().catch(() => {
    if (currentTrack === track) {
      currentTrack = null;
    }
  });
}

export function setAudioEnabled(enabled: boolean): void {
  setGlobalAudioEnabled(enabled);
}

export function playBackgroundMusicForPathname(pathname: string): void {
  if (pathname === "/battle") {
    playBackgroundMusic("battle");
    return;
  }

  if (pathname === "/devil-deal" || pathname === "/bonus-upgrade") {
    playBackgroundMusic("shop");
    return;
  }

  playBackgroundMusic("title");
}

onAudioEnabledChange((enabled) => {
  if (!enabled) {
    if (currentTrack !== null) {
      getAudio(currentTrack)?.pause();
    }
    return;
  }

  if (currentTrack === null) {
    playBackgroundMusicForPathname(getCurrentPathname());
    return;
  }

  const audio = getAudio(currentTrack);
  void audio?.play().catch(() => {});
});
