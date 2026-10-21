import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#9A9A9A] mb-6">
        <Link to="/" className="hover:text-[#1A1A1A]">Home</Link>
        <span>/</span>
        <span className="text-[#1A1A1A]">About</span>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#5A5A5A] hover:text-[#1A1A1A] mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to home
      </Link>

      <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">About KannadaConnect</h1>

      <div className="space-y-6 text-[#5A5A5A] text-sm leading-relaxed">
        <p>
          <strong className="text-[#1A1A1A]">KannadaConnect</strong> is an AI-powered Kannada
          communication assistant built for people who move to Karnataka but don't speak the local
          language. Whether you're a student, professional, or traveller, this app helps you
          communicate confidently in everyday situations.
        </p>

        <div className="bg-[#FDE8C0] rounded-2xl p-5">
          <h2 className="font-semibold text-[#1A1A1A] mb-2">Our mission</h2>
          <p>
            To bridge the language gap for Karnataka's growing diverse population — making it easier
            to navigate daily life while respecting and appreciating the beautiful Kannada language
            and culture.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-[#1A1A1A] mb-3">What we offer</h2>
          <ul className="space-y-2">
            {[
              'Curated Kannada phrases for 5 real-life situations',
              'Text-to-speech pronunciation for all phrases',
              'Transliteration in Roman script for easy reading',
              'Multi-language interface (English, Hindi, Tamil and more)',
              'AI conversation practice (coming soon)',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#C0392B] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[#9A9A9A] border-t border-[#E8E4DC] pt-4">
          🙏 ಧನ್ಯವಾದ (Dhanyavāda) — Thank you for using KannadaConnect.
        </p>
      </div>
    </div>
  );
}
