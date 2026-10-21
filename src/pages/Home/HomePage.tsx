import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import FeatureCardComponent from '../../components/FeatureCard/FeatureCard';
import StepCard from '../../components/StepCard/StepCard';
import { FEATURE_CARDS, HOW_IT_WORKS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Flag-inspired background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Yellow blob top-left */}
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#F5A623] opacity-[0.07] blur-3xl" />
          {/* Red blob bottom-right */}
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[#C0392B] opacity-[0.07] blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 sm:pt-24 sm:pb-20">
          {/* Flag-stripe accent */}
          <div className="flex items-center gap-1.5 mb-6">
            <span className="inline-block w-4 h-1.5 rounded-full bg-[#F5A623]" />
            <span className="inline-block w-4 h-1.5 rounded-full bg-[#C0392B]" />
            <span className="text-xs font-medium text-[#9A9A9A] ml-1">Karnataka • ಕರ್ನಾಟಕ</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] leading-[1.1] tracking-tight mb-4 max-w-3xl">
            {t('learnKannada')}{' '}
            <span className="text-[#C0392B]">{t('speakConfidently')}</span>{' '}
            <span className="text-[#F5A623]">{t('connectWithKarnataka')}</span>
          </h1>

          <p className="text-base sm:text-lg text-[#5A5A5A] max-w-xl leading-relaxed mb-8">
            {t('heroSubtitle')}
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C0392B] text-white rounded-2xl font-semibold text-sm hover:bg-[#a93226] transition-colors shadow-sm"
            >
              {t('startLearning')}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1A1A1A] rounded-2xl font-semibold text-sm border border-[#E8E4DC] hover:bg-[#FAF8F4] transition-colors shadow-sm"
            >
              <Sparkles size={15} className="text-[#F5A623]" />
              {t('practiceWithAI')}
            </Link>
          </div>

          {/* Subtle Kannada script watermark */}
          <div className="absolute right-8 top-8 text-[7rem] sm:text-[9rem] font-bold text-[#F5A623] opacity-[0.06] select-none pointer-events-none kannada-text leading-none hidden sm:block">
            ಕ
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">{t('whatDoYouNeedHelpWith')}</h2>
          <p className="text-sm text-[#9A9A9A]">{t('pickCategory')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURE_CARDS.map((card) => (
            <FeatureCardComponent key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white border-t border-[#E8E4DC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">{t('howItWorks')}</h2>
            <p className="text-sm text-[#9A9A9A]">{t('threeSimpleSteps')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-2 items-center">
            {HOW_IT_WORKS.map((step, i) => (
              <StepCard
                key={step.step}
                step={step}
                isLast={i === HOW_IT_WORKS.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Banner CTA ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flag-gradient rounded-3xl border border-[#E8E4DC] p-8 sm:p-10 text-center">
          <div className="text-3xl mb-3">🙏</div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-2">
            {t('readyToSpeak')}
          </h2>
          <p className="text-sm text-[#5A5A5A] mb-6 max-w-md mx-auto">
            {t('readyToSpeakSub')}
          </p>
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C0392B] text-white rounded-2xl font-semibold text-sm hover:bg-[#a93226] transition-colors shadow-sm"
          >
            {t('startLearningNow')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
