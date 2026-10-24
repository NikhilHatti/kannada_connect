import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#9A9A9A] mb-6">
        <Link to="/" className="hover:text-[#1A1A1A]">{t('navHome')}</Link>
        <span>/</span>
        <span className="text-[#1A1A1A]">{t('navAbout')}</span>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#5A5A5A] hover:text-[#1A1A1A] mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        {t('backToHome')}
      </Link>

      <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">{t('aboutTitle')}</h1>

      <div className="space-y-6 text-[#5A5A5A] text-sm leading-relaxed">
        <p>{t('aboutP1')}</p>

        <div className="bg-[#FDE8C0] rounded-2xl p-5">
          <h2 className="font-semibold text-[#1A1A1A] mb-2">{t('ourMission')}</h2>
          <p>{t('ourMissionDesc')}</p>
        </div>

        <div>
          <h2 className="font-semibold text-[#1A1A1A] mb-3">{t('whatWeOffer')}</h2>
          <ul className="space-y-2">
            {[
              t('offerItem1'),
              t('offerItem2'),
              t('offerItem3'),
              t('offerItem4'),
              t('offerItem5'),
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#C0392B] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[#9A9A9A] border-t border-[#E8E4DC] pt-4">
          {t('thankYouNote')}
        </p>
      </div>
    </div>
  );
}
