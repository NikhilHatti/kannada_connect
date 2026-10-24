// ─── Real Google OAuth Services via Google Identity Services (GIS) ───

export interface GoogleUserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export function getGoogleClientId(): string {
  // 1. Check environment variable
  const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (envId && envId.trim().length > 0) return envId.trim();

  // 2. Check localStorage (allows in-browser configuration without restarting dev server)
  const storedId = localStorage.getItem('kc_google_client_id');
  if (storedId && storedId.trim().length > 0) return storedId.trim();

  return '';
}

export function saveGoogleClientId(clientId: string): void {
  if (clientId.trim()) {
    localStorage.setItem('kc_google_client_id', clientId.trim());
  } else {
    localStorage.removeItem('kc_google_client_id');
  }
}

/**
 * Triggers Google's real OAuth account picker popup.
 * Uses prompt: 'select_account' so Google explicitly shows the account list.
 */
export function requestGoogleRealLogin(
  clientId: string,
  onSuccess: (profile: GoogleUserProfile) => void,
  onError: (errorMessage: string) => void
): void {
  if (!window.google?.accounts?.oauth2) {
    onError('Google Identity Services script is still loading. Please check your internet connection.');
    return;
  }

  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: async (response) => {
        if (response.error) {
          if (response.error === 'access_denied') {
            onError('Google sign-in was cancelled.');
          } else {
            onError(`Google OAuth error: ${response.error_description || response.error}`);
          }
          return;
        }

        if (response.access_token) {
          try {
            // Fetch verified user profile from Google's UserInfo API
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${response.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error(`Google UserInfo API returned status ${res.status}`);
            }

            const data = await res.json();
            onSuccess({
              name: data.name || data.given_name || 'Google User',
              email: data.email,
              avatar: data.picture,
            });
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to retrieve profile from Google';
            onError(msg);
          }
        }
      },
    });

    // Request token with prompt: 'select_account' to force Google to show the account chooser
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Could not launch Google authentication';
    onError(msg);
  }
}
