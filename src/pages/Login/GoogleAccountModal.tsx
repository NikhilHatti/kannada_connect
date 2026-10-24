import { useState, useEffect, useCallback } from 'react';
import { X, ExternalLink, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import {
  getGoogleClientId,
  saveGoogleClientId,
  requestGoogleRealLogin,
  type GoogleUserProfile,
} from '../../services/googleAuth';
import './GoogleAccountModal.css';

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleUserProfile) => void;
  initialError?: string;
}

export default function GoogleAccountModal({
  isOpen,
  onClose,
  onSelectAccount,
  initialError = '',
}: GoogleAccountModalProps) {
  const [clientId, setClientId] = useState(() => getGoogleClientId());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);

  const handleClose = useCallback(() => {
    setLoading(false);
    setError('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  function handleConnectGoogle(e: React.FormEvent) {
    e.preventDefault();
    const trimmedId = clientId.trim();
    if (!trimmedId) {
      setError('Please paste your Google OAuth Client ID');
      return;
    }

    setLoading(true);
    setError('');
    saveGoogleClientId(trimmedId);

    requestGoogleRealLogin(
      trimmedId,
      (profile) => {
        setLoading(false);
        onSelectAccount(profile);
        handleClose();
      },
      (err) => {
        setLoading(false);
        setError(err);
      }
    );
  }

  function handleDemoLogin() {
    onSelectAccount({
      name: 'Google Learner',
      email: 'learner@gmail.com',
    });
    handleClose();
  }

  return (
    <div
      className="g-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-modal-title"
    >
      <div className="g-modal-card">
        {/* Header */}
        <div className="g-modal-header">
          <div className="g-logo-wrap">
            {/* Google official SVG logo */}
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
              <path
                d="M44.5 20H24v8.5h11.7C34.2 33.9 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.4-.1-2.7-.5-4z"
                fill="#FFC107"
              />
              <path
                d="M6.3 14.7l7 5.1C15.1 16 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.6 7.9 6.3 14.7z"
                fill="#FF3D00"
              />
              <path
                d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.7 36 27 37 24 37c-5.7 0-10.2-3.1-11.7-7.5l-7 5.4C8.6 41.1 15.7 45 24 45z"
                fill="#4CAF50"
              />
              <path
                d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.2-4.2 5.5l6.6 5.4C41.8 36.4 45 30.7 45 24c0-1.4-.1-2.7-.5-4z"
                fill="#1976D2"
              />
            </svg>
            <span className="g-app-badge">Live Google Link</span>
          </div>

          {!loading && (
            <button
              type="button"
              onClick={handleClose}
              className="g-close-btn"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <h2 id="google-modal-title" className="g-modal-title">
          Connect with Google
        </h2>
        <p className="g-modal-sub">
          To launch Google&apos;s real account picker popup, provide your{' '}
          <strong>Google OAuth Client ID</strong>.
        </p>

        {error && (
          <div className="g-error-banner" role="alert">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleConnectGoogle} className="g-setup-form" noValidate>
          <div>
            <label htmlFor="g-client-id" className="g-field-label">
              Google OAuth Client ID
            </label>
            <input
              id="g-client-id"
              type="text"
              placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                if (error) setError('');
              }}
              className="g-input-text"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !clientId.trim()}
            className="g-primary-btn"
          >
            {loading ? (
              <>
                <span className="g-spinner" />
                <span>Opening Google Sign-In...</span>
              </>
            ) : (
              <>
                <KeyRound size={16} />
                <span>Launch Google Sign-In</span>
              </>
            )}
          </button>
        </form>

        {/* Step-by-step guide */}
        <div className="g-guide-card">
          <div className="g-guide-title">
            <ExternalLink size={14} />
            <span>How to get your free Google Client ID:</span>
          </div>
          <ol className="g-guide-steps">
            <li>
              Go to{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
              >
                Google Cloud Console Credentials
              </a>
            </li>
            <li>
              Click <strong>Create Credentials</strong> →{' '}
              <strong>OAuth client ID</strong> (Type: <strong>Web application</strong>)
            </li>
            <li>
              Under <em>Authorized JavaScript origins</em>, add:{' '}
              <span className="g-guide-code">http://localhost:5173</span>
            </li>
            <li>
              Paste the generated Client ID above or add to{' '}
              <span className="g-guide-code">.env.local</span> as{' '}
              <span className="g-guide-code">VITE_GOOGLE_CLIENT_ID</span>
            </li>
          </ol>
        </div>

        {/* Demo fallback */}
        <div className="g-demo-divider">
          <span className="g-demo-line" />
          <span className="g-demo-text">or quick test</span>
          <span className="g-demo-line" />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="g-demo-btn"
        >
          <Sparkles size={15} />
          <span>Continue with Demo Google Account</span>
        </button>
      </div>
    </div>
  );
}
