import { useEffect, useState } from 'react';

const synth = (): SpeechSynthesis | undefined => {
  try {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : undefined;
  } catch {
    return undefined;
  }
};

const findSlovenian = (): SpeechSynthesisVoice | undefined => {
  try {
    return synth()
      ?.getVoices()
      .find((v) => v.lang.toLowerCase().startsWith('sl'));
  } catch {
    return undefined;
  }
};

export const useSlovenianVoice = (): SpeechSynthesisVoice | undefined => {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | undefined>(findSlovenian);
  useEffect(() => {
    const s = synth();
    if (!s) return undefined;
    const update = (): void => setVoice(findSlovenian());
    s.addEventListener('voiceschanged', update);
    return () => s.removeEventListener('voiceschanged', update);
  }, []);
  return voice;
};

export const speak = (text: string, voice: SpeechSynthesisVoice): void => {
  const s = synth();
  if (!s) return;
  try {
    s.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    s.speak(utterance);
  } catch {
    // Reading aloud is optional; the text is always on screen.
  }
};

export const stopSpeaking = (): void => {
  try {
    synth()?.cancel();
  } catch {
    // Nothing to stop.
  }
};
