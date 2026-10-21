import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function PracticePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#9A9A9A] mb-6">
        <Link to="/" className="hover:text-[#1A1A1A]">Home</Link>
        <span>/</span>
        <span className="text-[#1A1A1A]">Practice with AI</span>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#5A5A5A] hover:text-[#1A1A1A] mb-8 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to home
      </Link>

      {/* Coming soon card */}
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-white rounded-3xl border border-[#E8E4DC] p-10 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#FADADD] flex items-center justify-center text-3xl mx-auto mb-5">
            🤖
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Sparkles size={14} className="text-[#F5A623]" />
            <span className="text-xs font-semibold text-[#F5A623] uppercase tracking-wide">Coming Soon</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">Practice with AI</h1>
          <p className="text-[#5A5A5A] text-sm leading-relaxed mb-6">
            Our AI tutor will let you have real Kannada conversations, correct your pronunciation,
            and help you build confidence step by step.
          </p>

          {/* Feature previews */}
          <div className="space-y-3 text-left mb-8">
            {[
              { icon: '💬', label: 'Simulated real-life conversations' },
              { icon: '🔊', label: 'Pronunciation feedback' },
              { icon: '📊', label: 'Progress tracking' },
              { icon: '🌐', label: 'Multi-language support' },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 bg-[#FAF8F4] rounded-xl px-4 py-3">
                <span>{feature.icon}</span>
                <span className="text-sm text-[#5A5A5A]">{feature.label}</span>
              </div>
            ))}
          </div>

          <Link
            to="/learn"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C0392B] text-white rounded-xl font-semibold text-sm hover:bg-[#a93226] transition-colors"
          >
            Learn phrases first
          </Link>
        </div>
      </div>
    </div>
  );
}
