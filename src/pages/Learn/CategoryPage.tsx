import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PhraseCard from '../../components/PhraseCard/PhraseCard';
import { FEATURE_CARDS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { t } = useLanguage();
  const card = FEATURE_CARDS.find((c) => c.id === categoryId);

  if (!card) return <Navigate to="/learn" replace />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#9A9A9A] mb-6">
        <Link to="/" className="hover:text-[#1A1A1A]">Home</Link>
        <span>/</span>
        <Link to="/learn" className="hover:text-[#1A1A1A]">Learn</Link>
        <span>/</span>
        <span className="text-[#1A1A1A]">{card.title}</span>
      </div>

      {/* Back */}
      <Link
        to="/learn"
        className="inline-flex items-center gap-1.5 text-sm text-[#5A5A5A] hover:text-[#1A1A1A] mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        {t('backToCategories')}
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
          card.color === 'yellow' ? 'bg-[#FDE8C0]' : 'bg-[#FADADD]'
        }`}>
          {card.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-0.5">{card.title}</h1>
          <p className="text-sm text-[#F5A623] font-medium kannada-text mb-1">{card.kannadaTitle}</p>
          <p className="text-sm text-[#5A5A5A]">{card.description}</p>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-[#FDE8C0] rounded-xl px-4 py-3 flex items-start gap-2 mb-6">
        <span className="text-lg">💡</span>
        <p className="text-sm text-[#5A5A5A]">
          {t('tapSpeaker')}
        </p>
      </div>

      {/* Phrase list */}
      {card.phrases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {card.phrases.map((phrase) => (
            <PhraseCard key={phrase.id} phrase={phrase} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🚧</div>
          <h3 className="font-semibold text-[#1A1A1A] mb-2">Coming soon</h3>
          <p className="text-sm text-[#9A9A9A]">We're working on this section. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
