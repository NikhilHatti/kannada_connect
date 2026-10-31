import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRightLeft,
  Volume2,
  Mic,
  MicOff,
  Copy,
  Check,
  Type,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { speakKannada } from '../../utils/speech';

/* ─── Language list ─── */
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ur', label: 'Urdu' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
];

/* ─── Translate via MyMemory (free, no key) ─── */
async function translateText(
  text: string,
  from: string,
  to: string
): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${from}|${to}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translation API error: ${res.status}`);

  const data = await res.json();
  return data.responseData?.translatedText ?? '';
}



/* ─── SpeechRecognition type shim ─── */
type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T }
  ? T
  : typeof window extends { webkitSpeechRecognition: infer T }
  ? T
  : unknown;

function getSpeechRecognition(): SpeechRecognitionType | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

/* ══════════════════════════════════════
   Component
   ══════════════════════════════════════ */

export default function TranslatePage() {
  const { t, selectedLanguage } = useLanguage();
  const [sourceLang, setSourceLang] = useState(selectedLanguage.code || 'en');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Sync sourceLang when global language changes
  useEffect(() => {
    if (selectedLanguage.code) {
      setSourceLang(selectedLanguage.code);
    }
  }, [selectedLanguage.code]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Auto-translate after user stops typing (600ms debounce) ── */
  const doTranslate = useCallback(
    async (text: string, from: string) => {
      if (!text.trim()) {
        setTranslatedText('');
        return;
      }
      setIsTranslating(true);
      setError('');
      try {
        const result = await translateText(text.trim(), from, 'kn');
        setTranslatedText(result);
      } catch {
        setError('Translation failed. Please try again.');
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      doTranslate(inputText, sourceLang);
    }, 600);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputText, sourceLang, doTranslate]);

  /* ── Voice input via Web Speech API ── */
  function toggleVoiceInput() {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)();
    recognition.lang = sourceLang === 'zh' ? 'zh-CN' : sourceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: { results: { transcript: string }[][] }) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  /* ── Copy ── */
  function handleCopy() {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleClear() {
    setInputText('');
    setTranslatedText('');
    setError('');
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#9A9A9A] mb-6">
        <Link to="/" className="hover:text-[#1A1A1A]">
          {t('navHome')}
        </Link>
        <span>/</span>
        <span className="text-[#1A1A1A]">{t('navTranslate')}</span>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#5A5A5A] hover:text-[#1A1A1A] mb-8 transition-colors"
      >
        <ArrowLeft size={15} />
        {t('backToHome')}
      </Link>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#FDE8C0] to-[#FADADD] rounded-full text-xs font-semibold text-[#C0392B] uppercase tracking-wide mb-4">
          <ArrowRightLeft size={13} />
          {t('translatorBadge')}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-2">
          {t('translateTitle')} <span className="text-[#C0392B]">ಕನ್ನಡ</span>
        </h1>
        <p className="text-[#5A5A5A] text-sm max-w-md mx-auto">
          {t('translateSubtitle')}
        </p>
      </div>

      {/* Translator card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl border border-[#E8E4DC] shadow-sm overflow-hidden">
          {/* ── Source panel ── */}
          <div className="p-5 sm:p-6">
            {/* Source language picker */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Type size={14} className="text-[#9A9A9A]" />
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="text-sm font-semibold text-[#1A1A1A] bg-transparent border-none outline-none cursor-pointer pr-6 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A9A9A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0 center',
                  }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice input button */}
              <button
                onClick={toggleVoiceInput}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 ${isListening
                    ? 'border-[#C0392B] bg-red-50 text-[#C0392B] animate-pulse scale-110'
                    : 'border-[#E8E4DC] text-[#9A9A9A] hover:text-[#C0392B] hover:border-[#C0392B] hover:bg-red-50'
                  }`}
                title={isListening ? t('listeningBtn') : t('voiceInputBtn')}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            {/* Input text area */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? t('listeningPlaceholder')
                  : t('inputPlaceholder')
              }
              rows={4}
              className="w-full resize-none text-[#1A1A1A] text-base placeholder-[#C0C0C0] bg-transparent border-none outline-none leading-relaxed"
            />

            {/* Character count & clear */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[#C0C0C0]">
                {inputText.length} {t('charactersCount')}
              </span>
              {inputText && (
                <button
                  onClick={handleClear}
                  className="text-xs text-[#9A9A9A] hover:text-[#C0392B] transition-colors"
                >
                  {t('clearBtn')}
                </button>
              )}
            </div>
          </div>

          {/* ── Divider with arrow ── */}
          <div className="relative">
            <div className="h-px bg-[#E8E4DC]" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-[#E8E4DC] flex items-center justify-center shadow-sm">
                {isTranslating ? (
                  <Loader2 size={16} className="animate-spin text-[#C0392B]" />
                ) : (
                  <ArrowRightLeft size={15} className="text-[#C0392B]" />
                )}
              </div>
            </div>
          </div>

          {/* ── Target panel (Kannada) ── */}
          <div className="p-5 sm:p-6 bg-[#FEFDFB]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#1A1A1A]">
                  ಕನ್ನಡ (Kannada)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Speak Kannada */}
                <button
                  onClick={() => translatedText && speakKannada(translatedText)}
                  disabled={!translatedText}
                  className="w-9 h-9 rounded-xl border border-[#E8E4DC] flex items-center justify-center text-[#F5A623] hover:bg-[#FDE8C0] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title={t('speakBtn')}
                >
                  <Volume2 size={16} />
                </button>

                {/* Copy */}
                <button
                  onClick={handleCopy}
                  disabled={!translatedText}
                  className="w-9 h-9 rounded-xl border border-[#E8E4DC] flex items-center justify-center text-[#9A9A9A] hover:text-[#1A1A1A] hover:bg-[#FAF8F4] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title={t('copyBtn')}
                >
                  {copied ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Translated output */}
            <div className="min-h-[100px]">
              {error ? (
                <p className="text-sm text-red-400">{error}</p>
              ) : translatedText ? (
                <p className="text-base text-[#1A1A1A] leading-relaxed kannada-text">
                  {translatedText}
                </p>
              ) : (
                <p className="text-base text-[#C0C0C0]">
                  {t('waitingTranslation')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick tips ── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: '⌨️',
              title: t('textToText'),
              desc: t('step1Desc'),
            },
            {
              icon: '🎤',
              title: t('voiceToText'),
              desc: t('step2Desc'),
            },
            {
              icon: '🔊',
              title: t('textToVoice'),
              desc: t('step3Desc'),
            },
          ].map((tip) => (
            <div
              key={tip.title}
              className="bg-white rounded-2xl border border-[#E8E4DC] p-4 text-center shadow-sm"
            >
              <div className="text-2xl mb-2">{tip.icon}</div>
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">
                {tip.title}
              </h3>
              <p className="text-xs text-[#9A9A9A] leading-relaxed">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
