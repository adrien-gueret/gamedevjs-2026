type AudioEnabledListener = (enabled: boolean) => void;

let isEnabled = false;
const listeners = new Set<AudioEnabledListener>();

export function isAudioEnabled(): boolean {
  return isEnabled;
}

export function setAudioEnabled(enabled: boolean): void {
  const nextEnabled = Boolean(enabled);

  if (isEnabled === nextEnabled) {
    return;
  }

  isEnabled = nextEnabled;
  listeners.forEach((listener) => listener(isEnabled));
}

export function onAudioEnabledChange(
  listener: AudioEnabledListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}