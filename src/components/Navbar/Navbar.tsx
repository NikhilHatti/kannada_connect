import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const { t } = useLanguage();

  const navLinks = [
    { label: t('navHome'), path: '/' },
    { label: t('navLearn'), path: '/learn' },
    { label: t('navMissions'), path: '/missions' },
    { label: t('navPractice'), path: '/practice' },
    { label: t('navTranslate'), path: '/translate' },
    { label: t('navAbout'), path: '/about' },
  ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8E4DC] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#C0392B] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ಕ
            </div>
            <span className="font-bold text-[#1A1A1A] text-lg tracking-tight">
              Kannada<span className="text-[#C0392B]">Connect</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#C0392B] bg-red-50 font-semibold'
                    : 'text-[#5A5A5A] hover:text-[#1A1A1A] hover:bg-[#FAF8F4]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: auth controls + language selector */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* User avatar indicator */}
                <div className="hidden sm:flex items-center gap-2">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover shadow-sm border border-[#E8E4DC]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5A623] to-[#C0392B] flex items-center justify-center text-white shadow-sm text-xs font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <User size={15} />}
                    </div>
                  )}
                  {user?.name && (
                    <span className="text-xs font-semibold text-[#3A3A3A] max-w-[110px] truncate">
                      {user.name}
                    </span>
                  )}
                </div>
                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E8E4DC] bg-white text-sm font-medium text-[#5A5A5A] hover:text-[#C0392B] hover:border-[#C0392B] transition-colors shadow-sm"
                  title={t('signOut')}
                >
                  <LogOut size={14} />
                  {t('signOut')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl border border-[#E8E4DC] bg-white text-sm font-medium text-[#1A1A1A] hover:bg-[#FAF8F4] transition-colors shadow-sm"
              >
                {t('signIn')}
              </Link>
            )}
            <LanguageSelector />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden gap-1 pb-2 overflow-x-auto scrollbar-none">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'text-[#C0392B] bg-red-50 font-semibold'
                  : 'text-[#5A5A5A] hover:bg-[#FAF8F4]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {/* Mobile logout */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium text-[#C0392B] hover:bg-red-50 transition-colors"
            >
              {t('signOut')}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
