import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GoogleAccountModal from './GoogleAccountModal';
import {
  getGoogleClientId,
  requestGoogleRealLogin,
  type GoogleUserProfile,
} from '../../services/googleAuth';
import './LoginPage.css';

// ── Validation helpers ──────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SPECIAL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

function validateName(val: string): string {
  if (!val.trim()) return 'Name is required.';
  if (val.trim().length < 2) return 'Name must be at least 2 characters.';
  return '';
}

function validateEmail(val: string): string {
  if (!val) return 'Email is required.';
  if (!EMAIL_RE.test(val)) return 'Enter a valid email address.';
  return '';
}

function validatePassword(val: string): string {
  if (!val) return 'Password is required.';
  if (val.length < 5) return 'Password must be at least 5 characters.';
  if (!SPECIAL_RE.test(val)) return 'Password must contain at least one special character.';
  return '';
}
// ────────────────────────────────────────────────

interface LoginPageProps {
  initialMode?: 'signin' | 'signup';
}

export default function LoginPage({ initialMode = 'signin' }: LoginPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [isSignUp, setIsSignUp] = useState(
    initialMode === 'signup' || searchParams.get('mode') === 'signup'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [generalMsg, setGeneralMsg] = useState('');

  // Per-field errors shown after the field is touched
  const [nameErr, setNameErr] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  function handleNameChange(val: string) {
    setName(val);
    if (touched.name) setNameErr(validateName(val));
  }

  function handleEmailChange(val: string) {
    setEmail(val);
    if (touched.email) setEmailErr(validateEmail(val));
  }

  function handlePasswordChange(val: string) {
    setPassword(val);
    if (touched.password) setPwErr(validatePassword(val));
  }

  function handleBlur(field: 'name' | 'email' | 'password') {
    setTouched((t) => ({ ...t, [field]: true }));
    if (field === 'name') setNameErr(validateName(name));
    if (field === 'email') setEmailErr(validateEmail(email));
    if (field === 'password') setPwErr(validatePassword(password));
  }

  function switchToSignUp() {
    setIsSignUp(true);
    setGeneralMsg('');
    setNameErr('');
    setEmailErr('');
    setPwErr('');
    setTouched({ name: false, email: false, password: false });
  }

  function switchToSignIn() {
    setIsSignUp(false);
    setGeneralMsg('');
    setNameErr('');
    setEmailErr('');
    setPwErr('');
    setTouched({ name: false, email: false, password: false });
  }

  function handleForgotPassword() {
    if (!email) {
      setEmailErr('Enter your email to receive a password reset link.');
      setTouched((t) => ({ ...t, email: true }));
      return;
    }
    const eErr = validateEmail(email);
    if (eErr) {
      setEmailErr(eErr);
      setTouched((t) => ({ ...t, email: true }));
      return;
    }
    setGeneralMsg(`Password reset instructions sent to ${email}`);
  }

  function handleGoogleButtonClick() {
    setGeneralMsg('');
    setGoogleError('');
    const clientId = getGoogleClientId();

    if (clientId) {
      setGoogleLoading(true);
      requestGoogleRealLogin(
        clientId,
        (profile) => {
          setGoogleLoading(false);
          login({
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar,
          });
          navigate('/');
        },
        (err) => {
          setGoogleLoading(false);
          setGoogleError(err);
          setIsGoogleModalOpen(true);
        }
      );
    } else {
      setIsGoogleModalOpen(true);
    }
  }

  function handleSelectGoogleAccount(account: GoogleUserProfile) {
    login({
      name: account.name,
      email: account.email,
      avatar: account.avatar,
    });
    setIsGoogleModalOpen(false);
    navigate('/');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralMsg('');

    if (isSignUp) {
      setTouched({ name: true, email: true, password: true });
      const nErr = validateName(name);
      const eErr = validateEmail(email);
      const pErr = validatePassword(password);
      setNameErr(nErr);
      setEmailErr(eErr);
      setPwErr(pErr);
      if (nErr || eErr || pErr) return;

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        login({ name: name.trim(), email: email.trim() });
        navigate('/');
      }, 1000);
    } else {
      setTouched((t) => ({ ...t, email: true, password: true }));
      const eErr = validateEmail(email);
      const pErr = validatePassword(password);
      setEmailErr(eErr);
      setPwErr(pErr);
      if (eErr || pErr) return;

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const resolvedName = email.split('@')[0] || 'Learner';
        login({ name: resolvedName, email: email.trim() });
        navigate('/');
      }, 1000);
    }
  }

  return (
    <div className="login-root">
      {/* ── Full-screen Karnataka background ── */}
      <img src="/karnataka_bg.jpg" alt="" className="login-bg-img" aria-hidden="true" />

      {/* Dark veil */}
      <div className="login-left-overlay" aria-hidden="true" />

      {/* ── Left panel: branding / tagline ── */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="flag-stripe-bar">
            <div className="flag-stripe yellow" />
            <div className="flag-stripe red" />
          </div>

          <div className="login-brand">
            <div className="login-logo-circle">ಕ</div>
            <span className="login-logo-text">
              Kannada<span className="login-logo-accent">Connect</span>
            </span>
          </div>

          <h2 className="login-left-headline">ಕನ್ನಡ ಕಲಿಯಿರಿ</h2>
          <p className="login-left-sub">
            Learn the language of Karnataka — spoken by over 50 million people worldwide.
          </p>

          <div className="login-stats">
            <div className="login-stat">
              <span className="login-stat-num">50M+</span>
              <span className="login-stat-label">Speakers</span>
            </div>
            <div className="login-stat-divider" />
            <div className="login-stat">
              <span className="login-stat-num">2000+</span>
              <span className="login-stat-label">Years old</span>
            </div>
            <div className="login-stat-divider" />
            <div className="login-stat">
              <span className="login-stat-num">8th</span>
              <span className="login-stat-label">Schedule lang.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: frosted-glass form ── */}
      <div className="login-right">
        <div className="login-form-container">
          {/* Mobile logo */}
          <div className="login-mobile-logo">
            <div className="login-logo-circle small">ಕ</div>
            <span className="login-logo-text">
              Kannada<span className="login-logo-accent">Connect</span>
            </span>
          </div>

          <h1 className="login-form-title">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="login-form-sub">
            {isSignUp
              ? 'Sign up free to begin your Kannada learning journey'
              : 'Sign in to continue your Kannada journey'}
          </p>

          {generalMsg && (
            <div className="login-message" role="status">
              ✓ {generalMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Full Name (Sign Up only) */}
            {isSignUp && (
              <div className="login-field">
                <label htmlFor="name" className="login-label">Full Name</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`login-input${nameErr ? ' login-input--error' : ''}`}
                  aria-invalid={!!nameErr}
                  aria-describedby={nameErr ? 'name-err' : undefined}
                />
                {nameErr && (
                  <span id="name-err" className="login-field-err">{nameErr}</span>
                )}
              </div>
            )}

            {/* Email */}
            <div className="login-field">
              <label htmlFor="email" className="login-label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`login-input${emailErr ? ' login-input--error' : ''}`}
                aria-invalid={!!emailErr}
                aria-describedby={emailErr ? 'email-err' : undefined}
              />
              {emailErr && (
                <span id="email-err" className="login-field-err">{emailErr}</span>
              )}
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="password" className="login-label">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="login-forgot"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="login-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`login-input${pwErr ? ' login-input--error' : ''}`}
                  aria-invalid={!!pwErr}
                  aria-describedby={pwErr ? 'pw-err' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-eye"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {pwErr && (
                <span id="pw-err" className="login-field-err">{pwErr}</span>
              )}
              {/* Password hint shown before touched */}
              {!touched.password && !pwErr && (
                <span className="login-field-hint">
                  Min 5 chars &amp; at least one special character (!@#$…)
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? (
                <span className="login-spinner" />
              ) : isSignUp ? (
                'Create free account'
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">or</span>
            <span className="login-divider-line" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleButtonClick}
            disabled={loading || googleLoading}
            className="login-google-btn"
          >
            {googleLoading ? (
              <>
                <span className="login-spinner small" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <path d="M44.5 20H24v8.5h11.7C34.2 33.9 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.4-.1-2.7-.5-4z" fill="#FFC107"/>
                  <path d="M6.3 14.7l7 5.1C15.1 16 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.6 7.9 6.3 14.7z" fill="#FF3D00"/>
                  <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.7 36 27 37 24 37c-5.7 0-10.2-3.1-11.7-7.5l-7 5.4C8.6 41.1 15.7 45 24 45z" fill="#4CAF50"/>
                  <path d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.2-4.2 5.5l6.6 5.4C41.8 36.4 45 30.7 45 24c0-1.4-.1-2.7-.5-4z" fill="#1976D2"/>
                </svg>
                {isSignUp ? 'Sign up with Google' : 'Continue with Google'}
              </>
            )}
          </button>

          {/* Toggle Sign in / Sign up */}
          {isSignUp ? (
            <p className="login-signup-text">
              Already have an account?{' '}
              <button
                type="button"
                onClick={switchToSignIn}
                className="login-signup-link"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p className="login-signup-text">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={switchToSignUp}
                className="login-signup-link"
              >
                Sign up free
              </button>
            </p>
          )}
        </div>
      </div>

      {/* ── Google Account Chooser Modal ── */}
      {isGoogleModalOpen && (
        <GoogleAccountModal
          isOpen={isGoogleModalOpen}
          onClose={() => {
            setIsGoogleModalOpen(false);
            setGoogleError('');
          }}
          onSelectAccount={handleSelectGoogleAccount}
          initialError={googleError}
        />
      )}
    </div>
  );
}
