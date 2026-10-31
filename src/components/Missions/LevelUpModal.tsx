import { useEffect } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import type { GamificationLevel } from '../../types/gamification';
import { soundEffects } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedLevel } from '../../data/gamificationTranslations';

interface LevelUpModalProps {
  level: GamificationLevel;
  onClose: () => void;
}

export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const { t, currentLang } = useLanguage();
  const localized = getLocalizedLevel(level, currentLang);

  useEffect(() => {
    soundEffects.playLevelUp();
  }, [level]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-amber-300 p-6 sm:p-8 text-center space-y-6 overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow background effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-amber-400 opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-red-500 opacity-20 blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Level Up Badge */}
        <div className="relative inline-block">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-200 border-4 border-white shadow-xl flex items-center justify-center text-5xl">
            {level.badgeIcon}
          </div>
          <div className="absolute -top-2 -right-2 bg-[#C0392B] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
            {t('realmLevelPrefix')} {level.level}
          </div>
        </div>

        {/* Headline */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <Sparkles size={14} className="text-amber-600" />
            {t('levelUpAchieved')}
          </div>
          <h2 className="text-2xl font-black text-[#1A1A1A]">
            {localized.title}
          </h2>
          <div className="text-lg font-bold text-[#C0392B] kannada-text mt-0.5">
            {level.kannadaTitle}
          </div>
          <p className="text-xs sm:text-sm text-[#5A5A5A] mt-2">
            {localized.description}
          </p>
        </div>

        {/* Perks list */}
        {level.perks && level.perks.length > 0 && (
          <div className="bg-[#FAF8F4] border border-[#E8E4DC] rounded-2xl p-4 text-left space-y-2">
            <div className="text-xs font-bold text-[#8A7A6A] uppercase tracking-wider">
              {t('unlockedPerksLabel')}
            </div>
            <ul className="space-y-1.5">
              {level.perks.map((perk, i) => (
                <li key={i} className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C0392B] to-[#F5A623] text-white font-bold text-sm shadow-md hover:opacity-95 transition-all"
        >
          {t('keepPracticingBtn')}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
