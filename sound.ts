let audioCtx: AudioContext | null = null;
let muted = false;

try {
  muted = localStorage.getItem('ndm_muted') === '1';
} catch {
  muted = false;
}

export function isSoundMuted(): boolean {
  return muted;
}

export function setSoundMuted(next: boolean): void {
  muted = next;
  try {
    localStorage.setItem('ndm_muted', next ? '1' : '0');
  } catch {
    // ignore storage failures
  }
}

function getContext(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playBellSound(
  reason: 'badalada' | 'noite_zero' | 'tribunal' | 'duel' | 'victory'
): void {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const triggerTone = (
    freq: number,
    startOffset: number,
    duration: number,
    type: OscillatorType = 'sine',
    peak = 0.22
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + startOffset);
    gain.gain.setValueAtTime(0.0001, now + startOffset);
    gain.gain.exponentialRampToValueAtTime(peak, now + startOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + startOffset);
    osc.stop(now + startOffset + duration + 0.05);
  };

  if (reason === 'badalada') {
    // Deep church bell toll twice
    triggerTone(220, 0, 1.8, 'triangle', 0.25);
    triggerTone(440, 0, 1.4, 'sine', 0.14);
    triggerTone(659.25, 0, 0.9, 'sine', 0.08);
    triggerTone(220, 0.9, 1.8, 'triangle', 0.22);
    triggerTone(440, 0.9, 1.4, 'sine', 0.12);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([180, 90, 220]);
    }
  } else if (reason === 'noite_zero') {
    triggerTone(196, 0, 1.4, 'sine', 0.18);
    triggerTone(293.66, 0.35, 1.2, 'sine', 0.12);
  } else if (reason === 'tribunal') {
    // Wooden gavel double knock
    triggerTone(130, 0, 0.18, 'square', 0.18);
    triggerTone(110, 0.22, 0.22, 'square', 0.18);
  } else if (reason === 'duel') {
    triggerTone(392, 0, 0.18, 'triangle', 0.18);
    triggerTone(523.25, 0.16, 0.28, 'triangle', 0.2);
  } else if (reason === 'victory') {
    triggerTone(261.63, 0, 0.4, 'triangle', 0.16);
    triggerTone(329.63, 0.15, 0.4, 'triangle', 0.16);
    triggerTone(392, 0.3, 0.6, 'triangle', 0.18);
    triggerTone(523.25, 0.45, 1.2, 'triangle', 0.2);
  }
}

export function speakNoiteZeroLine(text: string): void {
  if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 0.88;
    utter.pitch = 0.85;
    window.speechSynthesis.speak(utter);
  } catch {
    // ignore speech errors
  }
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
