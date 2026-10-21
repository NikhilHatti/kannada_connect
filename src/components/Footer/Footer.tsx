export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E8E4DC] bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#C0392B] flex items-center justify-center text-white font-bold text-sm">
              ಕ
            </div>
            <span className="font-semibold text-[#1A1A1A]">
              Kannada<span className="text-[#C0392B]">Connect</span>
            </span>
          </div>

          {/* Tagline */}
          <p className="text-sm text-[#9A9A9A] text-center">
            Learn Kannada. Speak confidently. Connect with Karnataka.
          </p>

          {/* Credit */}
          <p className="text-xs text-[#9A9A9A]">
            🇮🇳 Made with ❤️ for Karnataka
          </p>
        </div>
      </div>
    </footer>
  );
}
