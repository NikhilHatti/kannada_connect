import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LANGUAGES } from '../../data';

export default function LanguageSelector() {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E4DC] bg-white hover:bg-[#FAF8F4] text-sm font-medium text-[#1A1A1A] shadow-sm transition-colors"
        aria-label="Select language"
      >
        <Globe size={15} className="text-[#F5A623]" />
        <span>{selectedLanguage.nativeLabel}</span>
        <ChevronDown size={13} className={`text-[#9A9A9A] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg border border-[#E8E4DC] py-1 z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setSelectedLanguage(lang); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#FAF8F4] transition-colors ${
                selectedLanguage.code === lang.code
                  ? 'text-[#C0392B] font-semibold'
                  : 'text-[#1A1A1A]'
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-[#9A9A9A]">{lang.nativeLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
