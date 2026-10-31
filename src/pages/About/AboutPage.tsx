import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  MessageCircle,
  Languages,
  Trophy,
  ArrowRightLeft,
  Heart,
  Globe,
  Sparkles,
  Users,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const STATS = [
  { value: '50+', label: 'Curated Phrases' },
  { value: '7', label: 'Languages Supported' },
  { value: '4', label: 'Practice Scenarios' },
  { value: '5', label: 'Life Situations' },
];

const FEATURES = [
  {
    icon: BookOpen,
    color: '#F5A623',
    bg: '#FDE8C0',
    title: 'Phrase Library',
    desc: 'Real-life Kannada phrases for travel, shopping, dining, healthcare and workplace — all with audio.',
  },
  {
    icon: Volume2,
    color: '#C0392B',
    bg: '#FADADD',
    title: 'Native Pronunciation',
    desc: 'Hear every phrase spoken aloud with natural Kannada accent. Slow-mode available for beginners.',
  },
  {
    icon: MessageCircle,
    color: '#27AE60',
    bg: '#D5F5E3',
    title: 'AI Conversation Practice',
    desc: 'Simulate real scenarios — hail an auto, order food, ask for directions — all in interactive Kannada dialogue.',
  },
  {
    icon: ArrowRightLeft,
    color: '#2980B9',
    bg: '#D6EAF8',
    title: 'Instant Translator',
    desc: 'Type or speak in any language and get an instant Kannada translation with one-tap pronunciation.',
  },
  {
    icon: Trophy,
    color: '#8E44AD',
    bg: '#E8DAEF',
    title: 'Missions & Gamification',
    desc: 'Earn XP, unlock levels and badges as you complete speaking missions — learning that feels like a game.',
  },
  {
    icon: Languages,
    color: '#16A085',
    bg: '#D1F2EB',
    title: 'Multi-language UI',
    desc: 'The entire app works in English, Hindi, Tamil, Telugu, Malayalam, Marathi and Bengali.',
  },
];

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#9A9A9A] mb-6">
        <Link to="/" className="hover:text-[#1A1A1A]">{t('navHome')}</Link>
        <span>/</span>
        <span className="text-[#1A1A1A]">{t('navAbout')}</span>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#5A5A5A] hover:text-[#1A1A1A] mb-8 transition-colors"
      >
        <ArrowLeft size={15} />
        {t('backToHome')}
      </Link>

      {/* ── Hero banner ── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#2C1A0E] to-[#C0392B] p-8 sm:p-10 mb-10 text-white">
        <div className="absolute top-4 right-6 text-6xl opacity-10 select-none font-bold">ಕ</div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={12} />
            {t('aboutTitle')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
            ಕನ್ನಡ ಕಲಿಯಿರಿ. <br />
            <span className="text-[#F5A623]">ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಮಾತಾಡಿ.</span>
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl leading-relaxed">
            {t('aboutP1')}
          </p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-[#E8E4DC] p-4 text-center shadow-sm"
          >
            <div className="text-2xl font-extrabold text-[#C0392B] mb-0.5">{s.value}</div>
            <div className="text-xs text-[#9A9A9A] font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Mission ── */}
      <div className="bg-gradient-to-r from-[#FDE8C0] to-[#FFF3E0] rounded-2xl p-6 mb-10 border border-[#F5A623]/20">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F5A623]/20 flex items-center justify-center shrink-0">
            <Heart size={18} className="text-[#F5A623]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1A1A1A] mb-1">{t('ourMission')}</h2>
            <p className="text-sm text-[#5A5A5A] leading-relaxed">{t('ourMissionDesc')}</p>
          </div>
        </div>
      </div>

      {/* ── Features grid ── */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">{t('whatWeOffer')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-sm flex gap-4 hover:shadow-md transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: f.bg }}
              >
                <f.icon size={18} style={{ color: f.color }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">{f.title}</h3>
                <p className="text-xs text-[#9A9A9A] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Language support ── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 mb-10 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-[#C0392B]" />
          <h2 className="text-sm font-bold text-[#1A1A1A]">Supported Languages</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { lang: 'English', native: 'English', flag: '🇬🇧' },
            { lang: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
            { lang: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
            { lang: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
            { lang: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
            { lang: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
            { lang: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
          ].map((l) => (
            <div
              key={l.lang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F4] border border-[#E8E4DC] text-xs font-medium text-[#5A5A5A]"
            >
              <span>{l.flag}</span>
              <span>{l.native}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Built for ── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 mb-10 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-[#C0392B]" />
          <h2 className="text-sm font-bold text-[#1A1A1A]">Built For</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '🎓', label: 'Students', desc: 'New to Bengaluru for college or coaching' },
            { icon: '💼', label: 'Professionals', desc: 'Relocated for work, navigating city life' },
            { icon: '✈️', label: 'Travellers', desc: 'Exploring Karnataka\'s culture and cuisine' },
          ].map((item) => (
            <div key={item.label} className="bg-[#FAF8F4] rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-bold text-[#1A1A1A] mb-0.5">{item.label}</div>
              <div className="text-xs text-[#9A9A9A]">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Thank you note ── */}
      <div className="text-center py-6 border-t border-[#E8E4DC]">
        <div className="text-3xl mb-3">🙏</div>
        <p className="text-base font-bold text-[#1A1A1A] kannada-text mb-1">ಧನ್ಯವಾದ</p>
        <p className="text-sm text-[#5A5A5A] mb-4">{t('thankYouNote')}</p>
        <Link
          to="/learn"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#a93226] transition-colors"
        >
          <BookOpen size={15} />
          Start Learning
        </Link>
      </div>
    </div>
  );
}
