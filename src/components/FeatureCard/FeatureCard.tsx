import { Link } from 'react-router-dom';
import type { FeatureCard, UIStrings } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FeatureCardProps {
  card: FeatureCard;
}

const CATEGORY_TRANSLATIONS: Record<
  string,
  { titleKey: keyof UIStrings; descKey: keyof UIStrings }
> = {
  'bus-travel': { titleKey: 'catBusTitle', descKey: 'catBusDesc' },
  'shopping': { titleKey: 'catShoppingTitle', descKey: 'catShoppingDesc' },
  'restaurant': { titleKey: 'catRestaurantTitle', descKey: 'catRestaurantDesc' },
  'hospital': { titleKey: 'catHospitalTitle', descKey: 'catHospitalDesc' },
  'college-workplace': { titleKey: 'catCollegeTitle', descKey: 'catCollegeDesc' },
  'practice-ai': { titleKey: 'catPracticeTitle', descKey: 'catPracticeDesc' },
};

export default function FeatureCardComponent({ card }: FeatureCardProps) {
  const { t } = useLanguage();
  const isYellow = card.color === 'yellow';

  const mapping = CATEGORY_TRANSLATIONS[card.id];
  const translatedTitle = mapping ? t(mapping.titleKey) : card.title;
  const translatedDesc = mapping ? t(mapping.descKey) : card.description;

  return (
    <Link
      to={card.path}
      className="group block bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Icon + accent strip */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${
          isYellow ? 'bg-[#FDE8C0]' : 'bg-[#FADADD]'
        }`}
      >
        {card.icon}
      </div>

      <h3 className="font-semibold text-[#1A1A1A] text-base mb-0.5 group-hover:text-[#C0392B] transition-colors">
        {translatedTitle}
      </h3>

      <p className="text-xs font-medium text-[#F5A623] kannada-text mb-2">
        {card.kannadaTitle}
      </p>

      <p className="text-sm text-[#5A5A5A] leading-relaxed">
        {translatedDesc}
      </p>

      {/* Phrase count badge */}
      {card.phrases.length > 0 && (
        <div className="mt-4 flex items-center gap-1.5">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              isYellow ? 'bg-[#F5A623]' : 'bg-[#C0392B]'
            }`}
          />
          <span className="text-xs text-[#9A9A9A]">
            {card.phrases.length} {t('phrasesSuffix')}
          </span>
        </div>
      )}

      {card.id === 'practice-ai' && (
        <div className="mt-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FADADD] text-[#C0392B]">
            ✨ {t('comingSoon')}
          </span>
        </div>
      )}
    </Link>
  );
}
