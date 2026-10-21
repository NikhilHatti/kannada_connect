import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import FeatureCardComponent from '../../components/FeatureCard/FeatureCard';
import { FEATURE_CARDS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';

export default function LearnPage() {
  const { t } = useLanguage();
  const categories = FEATURE_CARDS.filter((c) => c.id !== 'practice-ai');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[#9A9A9A] mb-2">
          <Link to="/" className="hover:text-[#1A1A1A]">Home</Link>
          <span>/</span>
          <span className="text-[#1A1A1A]">Learn</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">{t('chooseCategory')}</h1>
        <p className="text-[#5A5A5A]">{t('chooseCategoryDesc')}</p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {categories.map((card) => (
          <FeatureCardComponent key={card.id} card={card} />
        ))}
      </div>

      {/* Practice CTA */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
        <div className="text-4xl">🤖</div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-semibold text-[#1A1A1A] mb-1">{t('readyToPractise')}</h3>
          <p className="text-sm text-[#5A5A5A]">{t('readyToPractiseDesc')}</p>
        </div>
        <Link
          to="/practice"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C0392B] text-white rounded-xl font-semibold text-sm hover:bg-[#a93226] transition-colors shrink-0"
        >
          {t('practiceWithAI')}
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
