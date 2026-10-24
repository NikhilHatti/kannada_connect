// High-Definition Speech Synthesis and Recognition for KannadaConnect

// Global cache for preloaded and fetched audio elements
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

/**
 * Maps Kannada Unicode characters to Devanagari Unicode.
 * Devanagari and Kannada share identical phonetic alphabetic ordering.
 * Used as an offline high-accuracy fallback for Indian neural engines like Google Hindi.
 */
export function kannadaToDevanagari(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Kannada unicode range: 0x0C80 - 0x0CFF
    if (code >= 0x0c80 && code <= 0x0cff) {
      // Map to Devanagari (0x0900 - 0x097F)
      const offset = code - 0x0c80;
      result += String.fromCharCode(0x0900 + offset);
    } else {
      result += text[i];
    }
  }
  return result;
}

export interface SpeakOptions {
  rate?: number;
  slow?: boolean;
  transliteration?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/** Stop any currently playing audio or speech utterance */
export function stopAudio(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Crystal-Clear Kannada Voice Engine
 * 1. Primary: Plays studio-grade native Kannada audio from high-fidelity TTS stream (/api/tts).
 * 2. Secondary (Offline Fallback): Intelligent browser SpeechSynthesis using native Kannada voice,
 *    or phonetic Devanagari mapping via Google Hindi / Indian English voices.
 */
export function speakKannada(
  text: string,
  optionsOrRate: SpeakOptions | number = 0.85
): void {
  if (typeof window === 'undefined') return;

  const options: SpeakOptions =
    typeof optionsOrRate === 'number'
      ? { rate: optionsOrRate, slow: optionsOrRate < 0.75 }
      : optionsOrRate;

  stopAudio();

  const isSlow = options.slow || (options.rate !== undefined && options.rate < 0.75);
  const cacheKey = `${text}_${isSlow ? 'slow' : 'normal'}`;
  const apiUrl = `/api/tts?text=${encodeURIComponent(text)}${isSlow ? '&slow=true' : ''}`;

  // 1. Try High-Definition Stream via HTML5 Audio
  const playNativeAudio = () => {
    try {
      const audioUrl = audioCache.get(cacheKey) || apiUrl;
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onplay = () => {
        options.onStart?.();
      };

      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        options.onEnd?.();
      };

      audio.onerror = () => {
        // Fallback to client synthesis if audio stream is blocked
        fallbackToSpeechSynthesis();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          fallbackToSpeechSynthesis();
        });
      }
    } catch {
      fallbackToSpeechSynthesis();
    }
  };

  // 2. Intelligent Browser SpeechSynthesis Fallback
  const fallbackToSpeechSynthesis = () => {
    if (!('speechSynthesis' in window)) {
      options.onEnd?.();
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const voices = synth.getVoices();

    // Priority 1: True native Kannada voice
    const kannadaVoice =
      voices.find((v) => v.lang === 'kn-IN') ??
      voices.find((v) => v.lang.startsWith('kn')) ??
      voices.find((v) => v.name.toLowerCase().includes('kannada')) ??
      null;

    if (kannadaVoice) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.voice = kannadaVoice;
      utt.lang = 'kn-IN';
      utt.rate = isSlow ? 0.65 : (options.rate ?? 0.85);
      utt.pitch = 1.0;
      utt.onstart = () => options.onStart?.();
      utt.onend = () => options.onEnd?.();
      utt.onerror = () => options.onEnd?.();
      synth.speak(utt);
      return;
    }

    // Priority 2: Indian neural Hindi voice (with 1-to-1 Devanagari transliteration for authentic pronunciation)
    const indianVoice =
      voices.find((v) => v.name.toLowerCase().includes('google') && v.lang.startsWith('hi')) ??
      voices.find((v) => v.lang === 'hi-IN') ??
      voices.find((v) => v.lang.startsWith('hi')) ??
      voices.find((v) => v.lang === 'en-IN') ??
      null;

    if (indianVoice && indianVoice.lang.startsWith('hi')) {
      const devanagariText = kannadaToDevanagari(text);
      const utt = new SpeechSynthesisUtterance(devanagariText);
      utt.voice = indianVoice;
      utt.lang = 'hi-IN';
      utt.rate = isSlow ? 0.65 : 0.82;
      utt.pitch = 1.0;
      utt.onstart = () => options.onStart?.();
      utt.onend = () => options.onEnd?.();
      utt.onerror = () => options.onEnd?.();
      synth.speak(utt);
      return;
    }

    // Priority 3: Indian English voice with Roman transliteration
    const indianEnglishVoice =
      voices.find((v) => v.lang === 'en-IN') ??
      voices.find((v) => v.name.toLowerCase().includes('india')) ??
      null;

    const speechText = options.transliteration || text;
    const utt = new SpeechSynthesisUtterance(speechText);
    if (indianEnglishVoice) {
      utt.voice = indianEnglishVoice;
      utt.lang = 'en-IN';
    }
    utt.rate = isSlow ? 0.65 : 0.85;
    utt.onstart = () => options.onStart?.();
    utt.onend = () => options.onEnd?.();
    utt.onerror = () => options.onEnd?.();
    synth.speak(utt);
  };

  playNativeAudio();
}

// Global declaration for SpeechRecognition in browsers
export interface BrowserSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export function createSpeechRecognizer(handlers: SpeechRecognitionHandlers) {
  if (!isSpeechRecognitionSupported()) {
    handlers.onError?.('Speech recognition is not supported in this browser.');
    return null;
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionClass) return null;

  const recognizer = new SpeechRecognitionClass();
  recognizer.continuous = false;
  recognizer.interimResults = true;
  // Try Kannada language recognition; many browsers recognize Kannada speech
  recognizer.lang = 'kn-IN';

  recognizer.onstart = () => {
    handlers.onStart?.();
  };

  recognizer.onresult = (event: any) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const transcript = finalTranscript || interimTranscript;
    handlers.onResult(transcript.trim(), !!finalTranscript);
  };

  recognizer.onerror = (event: any) => {
    handlers.onError?.(event.error);
  };

  recognizer.onend = () => {
    handlers.onEnd?.();
  };

  return recognizer;
}

/**
 * Normalized string similarity calculation for evaluating spoken Kannada or transliteration
 */
export function calculatePhraseMatch(
  spoken: string,
  targetKannada: string,
  transliteration: string,
  expectedPhonetics: string[] = []
): { score: number; feedback: string } {
  if (!spoken || spoken.trim().length === 0) {
    return { score: 0, feedback: 'No voice detected. Please try again!' };
  }

  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s\u0C80-\u0CFF]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

  const cleanSpoken = clean(spoken);
  const cleanKannada = clean(targetKannada);
  const cleanTranslit = clean(transliteration);

  // Direct Kannada script match
  if (cleanSpoken === cleanKannada || cleanSpoken.includes(cleanKannada)) {
    return { score: 100, feedback: 'Perfect Kannada pronunciation! ಅದ್ಭುತ (Awesome)!' };
  }

  // Check expected phonetic variations
  for (const exp of expectedPhonetics) {
    const cleanExp = clean(exp);
    if (cleanSpoken.includes(cleanExp) || cleanExp.includes(cleanSpoken)) {
      return { score: 95, feedback: 'Superb! Spot on phrasing and tone!' };
    }
  }

  // Token overlap comparison with transliteration or phonetic match
  const spokenWords = cleanSpoken.split(' ');
  const translitWords = cleanTranslit.split(' ');

  let matchCount = 0;
  for (const sw of spokenWords) {
    if (sw.length < 2) continue;
    const found = translitWords.some((tw) => tw.includes(sw) || sw.includes(tw));
    if (found) matchCount++;
  }

  const ratio = translitWords.length > 0 ? matchCount / translitWords.length : 0;
  if (ratio >= 0.6) {
    const score = Math.min(95, Math.round(75 + ratio * 20));
    return { score, feedback: 'Great job! Clear and confident pronunciation!' };
  }

  if (cleanSpoken.length > 3) {
    return { score: 80, feedback: 'Good effort! Keep practicing to get the flow natural!' };
  }

  return { score: 65, feedback: 'Heard you! Try speaking a bit louder or closer to the mic.' };
}
