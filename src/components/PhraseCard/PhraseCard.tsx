import { useState, useCallback, useEffect, useRef } from 'react';
import { Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Phrase } from '../../types';
import type { SupportedLang } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { speakKannada, stopAudio } from '../../utils/speech';

interface PhraseCardProps {
  phrase: Phrase;
}

export default function PhraseCard({ phrase }: PhraseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { selectedLanguage, t } = useLanguage();
  const isMounted = useRef(true);

  const langCode = selectedLanguage.code as SupportedLang;
  const displayText = phrase.translations[langCode] ?? phrase.translations['en'];

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopAudio();
    };
  }, []);

  const speak = useCallback(() => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakKannada(phrase.kannada, {
      transliteration: phrase.transliteration,
      onEnd: () => {
        if (isMounted.current) setIsPlaying(false);
      },
    });
  }, [isPlaying, phrase.kannada, phrase.transliteration]);

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
