import { Link } from 'react-router-dom';
import type { FeatureCard } from '../../types';

interface FeatureCardProps {
  card: FeatureCard;
}

export default function FeatureCardComponent({ card }: FeatureCardProps) {
  const isYellow = card.color === 'yellow';

  return (
    <Link
      to={card.path}
      className="group block bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Icon + accent strip */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${
        isYellow
          ? 'bg-[#FDE8C0]'
          : 'bg-[#FADADD]'
      }`}>
        {card.icon}
      </div>

      <h3 className="font-semibold text-[#1A1A1A] text-base mb-0.5 group-hover:text-[#C0392B] transition-colors">
        {card.title}
      </h3>

      <p className="text-xs font-medium text-[#F5A623] kannada-text mb-2">
        {card.kannadaTitle}
      </p>

      <p className="text-sm text-[#5A5A5A] leading-relaxed">
        {card.description}
      </p>

      {/* Phrase count badge */}
      {card.phrases.length > 0 && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isYellow ? 'bg-[#F5A623]' : 'bg-[#C0392B]'}`} />
          <span className="text-xs text-[#9A9A9A]">{card.phrases.length} phrases</span>
        </div>
      )}

      {card.id === 'practice-ai' && (
        <div className="mt-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FADADD] text-[#C0392B]">
            ✨ Coming soon
          </span>
        </div>
      )}
    </Link>
  );
}
