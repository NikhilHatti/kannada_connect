// High-Definition Speech Synthesis and Recognition for KannadaConnect

let currentAudio: HTMLAudioElement | null = null;
// Keepalive timer reference — prevents Chrome's ~15s TTS cutoff bug
let ttsKeepAlive: ReturnType<typeof setInterval> | null = null;

/**
 * Clears the Chrome TTS keepalive timer.
 */
function clearKeepAlive() {
  if (ttsKeepAlive !== null) {
    clearInterval(ttsKeepAlive);
    ttsKeepAlive = null;
  }
}

/**
 * Chrome silently kills SpeechSynthesis utterances after ~15 seconds.
 * Calling pause()+resume() every 10 s tricks Chrome into keeping it alive
 * for the full duration of the sentence/paragraph.
 */
function startKeepAlive(synth: SpeechSynthesis) {
  clearKeepAlive();
  ttsKeepAlive = setInterval(() => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      synth.resume();
    } else if (!synth.speaking) {
      clearKeepAlive();
    }
  }, 10_000);
}

/**
 * Build a SpeechSynthesisUtterance wired up with keepalive + callbacks.
 * All priority paths share this so behaviour is identical everywhere.
 */
function makeUtterance(
  text: string,
  rate: number,
  synth: SpeechSynthesis,
  onStart?: () => void,
  onEnd?: () => void
): SpeechSynthesisUtterance {
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate   = rate;
  utt.pitch  = 1.0;
  utt.volume = 1.0;
  utt.onstart = () => {
    startKeepAlive(synth);
    onStart?.();
  };
  utt.onend = () => {
    clearKeepAlive();
    onEnd?.();
  };
  utt.onerror = () => {
    clearKeepAlive();
    onEnd?.();
  };
  return utt;
}

/**
 * Maps Kannada Unicode characters to Devanagari Unicode.
 *
 * Kannada and Devanagari share the same phonetic alphabet ordering so a
 * simple code-point offset (0x0C80 → 0x0900) works for most characters.
 *
 * However, Kannada has four "short" vowel code-points that exist in Unicode
 * but are NOT part of standard Hindi — the Hindi TTS engine stops as soon as
 * it encounters them.  We remap them to the closest long-vowel equivalents
 * that Hindi TTS handles correctly:
 *
 *   ಎ  0x0C8E  short-e        → ए  0x090F  (Hindi long-e)
 *   ಒ  0x0C92  short-o        → ओ  0x0913  (Hindi long-o)
 *   ೆ  0x0CC6  short-e matra  → े  0x0947  (Hindi long-e matra)
 *   ೊ  0x0CCA  short-o matra  → ो  0x094B  (Hindi long-o matra)
 */
export function kannadaToDevanagari(text: string): string {
  // Post-conversion corrections: Devanagari code-point → safe Hindi equivalent
  const corrections: Record<number, number> = {
    0x090E: 0x090F, // ऎ short-e        → ए long-e
    0x0912: 0x0913, // ऒ short-o        → ओ long-o
    0x0946: 0x0947, // ॆ short-e matra  → े long-e matra
    0x094A: 0x094B, // ॊ short-o matra  → ो long-o matra
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Kannada unicode range: 0x0C80 - 0x0CFF
    if (code >= 0x0c80 && code <= 0x0cff) {
      const mapped = 0x0900 + (code - 0x0c80);
      result += String.fromCharCode(corrections[mapped] ?? mapped);
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
  clearKeepAlive();
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
 * Split text into short chunks at natural break points so Chrome's TTS
 * engine never receives a block long enough to trigger its silent cutoff.
 * Each chunk is spoken sequentially via the onend → next chain.
 */
function splitIntoChunks(text: string): string[] {
  // Split at sentence-ending punctuation, commas, and Kannada dandas (।)
  const raw = text
    .split(/(?<=[.!?।,])\s+/)
    .flatMap((seg) => {
      // If a segment is still long (>120 chars), split further at spaces
      if (seg.length > 120) {
        const words = seg.split(' ');
        const sub: string[] = [];
        let cur = '';
        for (const w of words) {
          if ((cur + ' ' + w).trim().length > 100) {
            if (cur) sub.push(cur.trim());
            cur = w;
          } else {
            cur = cur ? cur + ' ' + w : w;
          }
        }
        if (cur) sub.push(cur.trim());
        return sub;
      }
      return [seg];
    })
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return raw.length > 0 ? raw : [text.trim()];
}

/**
 * Speak a queue of chunks sequentially.
 * Chrome's cancel()+speak() timing bug is avoided by deferring each speak()
 * by one macrotask (setTimeout 0) so the browser's TTS pipeline fully settles
 * between cancel and the next enqueue.
 */
function speakChunks(
  chunks: string[],
  voice: SpeechSynthesisVoice | null,
  lang: string,
  rate: number,
  synth: SpeechSynthesis,
  onStart?: () => void,
  onEnd?: () => void
): void {
  let index = 0;

  const speakNext = () => {
    if (index >= chunks.length) {
      clearKeepAlive();
      onEnd?.();
      return;
    }

    const chunk = chunks[index++];
    const utt = new SpeechSynthesisUtterance(chunk);
    if (voice) utt.voice = voice;
    utt.lang   = lang;
    utt.rate   = rate;
    utt.pitch  = 1.0;
    utt.volume = 1.0;

    if (index === 1) {
      // Fire onStart only for the very first chunk
      utt.onstart = () => {
        startKeepAlive(synth);
        onStart?.();
      };
    } else {
      utt.onstart = () => startKeepAlive(synth);
    }

    utt.onend   = () => { clearKeepAlive(); setTimeout(speakNext, 50); };
    utt.onerror = () => { clearKeepAlive(); setTimeout(speakNext, 50); };

    // Defer the speak() call so Chrome's cancel() pipeline fully settles first
    setTimeout(() => synth.speak(utt), 0);
  };

  speakNext();
}

/**
 * Crystal-Clear Kannada Voice Engine (Enhanced)
 *
 * Priority chain — same engine used everywhere in the app:
 * 1. Native browser kn-IN voice        — true Kannada accent, best quality
 * 2. Google Hindi (hi-IN) voice with Devanagari transliteration
 *    — Kannada & Devanagari share the same phonetic alphabet ordering,
 *      so a Hindi neural voice produces the closest Indian accent when
 *      a native Kannada voice is unavailable
 * 3. Indian English (en-IN) voice with Roman transliteration
 * 4. Any available voice with Roman transliteration
 *
 * Fixes applied:
 *  - Chunked sequential speaking → sentences are always fully spoken
 *  - setTimeout(0) defer after cancel() → Chrome timing bug eliminated
 *  - onvoiceschanged guard → voices always loaded before selection
 *  - Keepalive timer → Chrome 15s background cutoff prevented
 *  - volume = 1.0 everywhere for maximum clarity
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

  const isSlow    = options.slow || (options.rate !== undefined && options.rate < 0.75);
  const normalRate = 0.85;
  const slowRate   = 0.65;

  if (!('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  const synth = window.speechSynthesis;
  // Cancel any ongoing speech — we defer the actual speak() so this settles first
  synth.cancel();

  const doSpeak = () => {
    const voices = synth.getVoices();

    /* ── Priority 1: Native Kannada voice ── */
    const kannadaVoice =
      voices.find((v) => v.lang === 'kn-IN') ??
      voices.find((v) => v.lang.startsWith('kn')) ??
      voices.find((v) => v.name.toLowerCase().includes('kannada')) ??
      null;

    if (kannadaVoice) {
      speakChunks(
        splitIntoChunks(text),
        kannadaVoice, 'kn-IN',
        isSlow ? slowRate : (options.rate ?? normalRate),
        synth, options.onStart, options.onEnd
      );
      return;
    }

    /* ── Priority 2: Hindi neural voice with Devanagari mapping ── */
    const hindiVoice =
      voices.find((v) => v.name.toLowerCase().includes('google') && v.lang.startsWith('hi')) ??
      voices.find((v) => v.lang === 'hi-IN') ??
      voices.find((v) => v.lang.startsWith('hi')) ??
      null;

    if (hindiVoice) {
      const devanagariText = kannadaToDevanagari(text);
      speakChunks(
        splitIntoChunks(devanagariText),
        hindiVoice, 'hi-IN',
        isSlow ? slowRate : 0.82,
        synth, options.onStart, options.onEnd
      );
      return;
    }

    /* ── Priority 3: Indian English with Roman transliteration ── */
    const indianEnglishVoice =
      voices.find((v) => v.name.toLowerCase().includes('google') && v.lang === 'en-IN') ??
      voices.find((v) => v.lang === 'en-IN') ??
      voices.find((v) => v.name.toLowerCase().includes('india')) ??
      null;

    const speechText = options.transliteration || text;
    speakChunks(
      splitIntoChunks(speechText),
      indianEnglishVoice, indianEnglishVoice?.lang ?? 'en-IN',
      isSlow ? slowRate : normalRate,
      synth, options.onStart, options.onEnd
    );
  };

  // Voices may not be populated on the very first call — wait for them
  if (synth.getVoices().length > 0) {
    // Small defer so synth.cancel() fully settles before we enqueue
    setTimeout(doSpeak, 50);
  } else {
    synth.onvoiceschanged = () => {
      synth.onvoiceschanged = null;
      setTimeout(doSpeak, 50);
    };
  }
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
