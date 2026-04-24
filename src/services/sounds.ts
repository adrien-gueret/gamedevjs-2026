import { isAudioEnabled, onAudioEnabledChange } from "./audio";

export type GameSound =
  | "acceptDeal"
  | "activeCursedSymbol"
  | "activeSymbol"
  | "click"
  | "curseSymbol"
  | "heal"
  | "hit"
  | "insertSymbol"
  | "lock"
  | "removeSymbol"
  | "spin"
  | "startSpin"
  | "stopSpin";

const SOUND_EFFECT_VOLUME = 1;

const soundToAudioId: Record<GameSound, string> = {
  acceptDeal: "audio-sound-accept-deal",
  activeCursedSymbol: "audio-sound-active-cursed-symbol",
  activeSymbol: "audio-sound-active-symbol",
  click: "audio-sound-click",
  curseSymbol: "audio-sound-curse-symbol",
  heal: "audio-sound-heal",
  hit: "audio-sound-hit",
  insertSymbol: "audio-sound-insert-symbol",
  lock: "audio-sound-lock",
  removeSymbol: "audio-sound-remove-symbol",
  spin: "audio-sound-spin",
  startSpin: "audio-sound-start-spin",
  stopSpin: "audio-sound-stop-spin",
};

const activePlayers = new Set<HTMLAudioElement>();
const loopingPlayers = new Map<GameSound, HTMLAudioElement>();

function getAudio(sound: GameSound): HTMLAudioElement | null {
  const audio = document.getElementById(soundToAudioId[sound]);

  if (audio instanceof HTMLAudioElement) {
    return audio;
  }

  return null;
}

function releasePlayer(player: HTMLAudioElement): void {
  activePlayers.delete(player);
}

export function playSound(sound: GameSound): void {
  if (!isAudioEnabled()) {
    return;
  }

  const source = getAudio(sound);

  if (!source) {
    return;
  }

  source.volume = SOUND_EFFECT_VOLUME;

  if (sound === "spin") {
    stopSound("spin");

    const loopPlayer = source.cloneNode(true);

    if (!(loopPlayer instanceof HTMLAudioElement)) {
      return;
    }

    loopPlayer.volume = SOUND_EFFECT_VOLUME;
    loopPlayer.currentTime = 0;
    loopPlayer.loop = true;
    activePlayers.add(loopPlayer);
    loopingPlayers.set("spin", loopPlayer);

    loopPlayer.addEventListener(
      "error",
      () => {
        activePlayers.delete(loopPlayer);
        if (loopingPlayers.get("spin") === loopPlayer) {
          loopingPlayers.delete("spin");
        }
      },
      { once: true },
    );

    void loopPlayer.play().catch(() => {
      activePlayers.delete(loopPlayer);
      if (loopingPlayers.get("spin") === loopPlayer) {
        loopingPlayers.delete("spin");
      }
    });

    return;
  }

  const player = source.cloneNode(true);

  if (!(player instanceof HTMLAudioElement)) {
    return;
  }

  player.volume = SOUND_EFFECT_VOLUME;
  player.currentTime = 0;
  activePlayers.add(player);

  player.addEventListener("ended", () => releasePlayer(player), {
    once: true,
  });
  player.addEventListener("error", () => releasePlayer(player), {
    once: true,
  });

  void player.play().catch(() => {
    releasePlayer(player);
  });
}

export function stopSound(sound: GameSound): void {
  const loopPlayer = loopingPlayers.get(sound);

  if (!loopPlayer) {
    return;
  }

  loopPlayer.pause();
  loopPlayer.currentTime = 0;
  activePlayers.delete(loopPlayer);
  loopingPlayers.delete(sound);
}

export function stopAllSounds(): void {
  (Object.keys(soundToAudioId) as GameSound[]).forEach((sound) => {
    stopSound(sound);
  });

  activePlayers.forEach((player) => {
    player.pause();
    player.currentTime = 0;
  });

  activePlayers.clear();
}

onAudioEnabledChange((enabled) => {
  if (!enabled) {
    stopAllSounds();
  }
});
