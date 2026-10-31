import { useEffect } from 'react';
import { Award, X } from 'lucide-react';
import type { AchievementBadge } from '../../types/gamification';
import { soundEffects } from '../../utils/soundEffects';
import { useLanguage } from '../../context/LanguageContext';

interface BadgeModalProps {
  badge: AchievementBadge;
  onClose: () => void;
}

export default function BadgeModal({ badge, onClose }: BadgeModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    soundEffects.playXp();
  }, [badge]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border-2 border-amber-300 p-6 text-center space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
        >
          <X size={18} />
        </button>

        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-inner">
          {badge.icon}
        </div>

        <div>
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 border border-amber-200">
            <Award size={12} />
            {t('badgeUnlockedHeading')}
          </div>
          <h3 className="text-xl font-bold text-[#1A1A1A]">{badge.name}</h3>
          <div className="text-sm font-semibold text-[#C0392B] kannada-text">
            {badge.kannadaName}
          </div>
          <p className="text-xs text-[#5A5A5A] mt-2">{badge.description}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1A1A1A] text-white font-bold text-xs hover:bg-neutral-800 transition-colors"
        >
          {t('awesomeBtn')}
        </button>
      </div>
    </div>
  );
}
