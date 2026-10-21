import { useState, useCallback, useEffect, useRef } from 'react';
import { Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Phrase } from '../../types';
import type { SupportedLang } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface PhraseCardProps {
  phrase: Phrase;
}

/* ─────────────────────────────────────────────────────────────
   Voice helper — loads voices once, picks the best Kannada one
   ───────────────────────────────────────────────────────────── */
let kannadaVoice: SpeechSynthesisVoice | null = null;
let voicesReady = false;

function loadVoices(): void {
  const synth = window.speechSynthesis;

  function pickAndCache() {
    const voices = synth.getVoices();
    if (voices.length === 0) return;
    voicesReady = true;

    // Priority order: exact kn-IN → any kn-* → "Kannada" in name → hi-IN
    kannadaVoice =
      voices.find((v) => v.lang === 'kn-IN') ??
      voices.find((v) => v.lang.startsWith('kn')) ??
      voices.find((v) => v.name.toLowerCase().includes('kannada')) ??
      voices.find((v) => v.lang === 'hi-IN') ??
      null;
  }

  pickAndCache();
  if (!voicesReady) {
    synth.onvoiceschanged = () => pickAndCache();
  }
}

/* ─────────────────────────────────────────────────────────────
   Speak — instant, no network call, no delay
   ───────────────────────────────────────────────────────────── */
function speakKannada(text: string, onEnd?: () => void): void {
  const synth = window.speechSynthesis;
  synth.cancel();

  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'kn-IN';
  utt.rate = 0.85;   // natural pace — clear syllables without robotic drag
  utt.pitch = 1.0;
  utt.volume = 1.0;

  if (kannadaVoice) utt.voice = kannadaVoice;

  utt.onend = () => onEnd?.();
  utt.onerror = () => onEnd?.();
  synth.speak(utt);
}

/* ─────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────── */
export default function PhraseCard({ phrase }: PhraseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { selectedLanguage, t } = useLanguage();
  const isMounted = useRef(true);

  const langCode = selectedLanguage.code as SupportedLang;
  const displayText = phrase.translations[langCode] ?? phrase.translations['en'];

  useEffect(() => {
    isMounted.current = true;
    if ('speechSynthesis' in window && !voicesReady) loadVoices();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakKannada(phrase.kannada, () => {
      if (isMounted.current) setIsPlaying(false);
    });
  }, [isPlaying, phrase.kannada]);

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#5A5A5A] mb-1">{displayText}</p>
          <p className="text-base font-semibold text-[#1A1A1A] kannada-text">{phrase.kannada}</p>
        </div>

        <button
          onClick={speak}
          title={isPlaying ? 'Stop' : 'Listen'}
          aria-label="Hear Kannada pronunciation"
          className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 ${
            isPlaying
              ? 'border-[#F5A623] bg-[#FDE8C0] text-[#E8941A] scale-110'
              : 'border-[#E8E4DC] text-[#F5A623] hover:bg-[#FDE8C0]'
          }`}
        >
          <Volume2 size={16} className={isPlaying ? 'animate-pulse' : ''} />
        </button>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 flex items-center gap-1 text-xs text-[#9A9A9A] hover:text-[#5A5A5A] transition-colors"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? t('hidePronunciation') : t('showPronunciation')}
      </button>

      {expanded && (
        <div className="mt-2 pl-3 border-l-2 border-[#F5A623]">
          <p className="text-xs text-[#5A5A5A] italic mb-0.5">{phrase.transliteration}</p>
          {phrase.context && (
            <p className="text-xs text-[#9A9A9A]">💡 {phrase.context}</p>
          )}
        </div>
      )}
    </div>
  );
}
