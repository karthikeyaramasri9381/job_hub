import React, { useEffect, useRef } from 'react';

const GoogleSignInButton = ({ onSuccess, onError, role = 'CANDIDATE' }) => {
  const buttonDivRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not configured in .env");
      return;
    }

    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id && buttonDivRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.('Google authentication failed: missing credential');
            }
          },
        });

        window.google.accounts.id.renderButton(buttonDivRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'rectangular',
        });
      }
    };

    loadGoogleScript();
  }, [clientId, onSuccess, onError]);

  if (!clientId) {
    return (
      <button
        type="button"
        className="btn-google-fallback"
        onClick={() => {
          alert("Google Sign-In Client ID is not configured in frontend .env file yet. Add VITE_GOOGLE_CLIENT_ID to enable Google authentication.");
        }}
        style={{
          width: '100%',
          padding: '10px 16px',
          border: '1px solid #d0d7de',
          borderRadius: '6px',
          backgroundColor: '#fff',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.41-1.57-5.13-3.72L.97 13.06C2.45 16 5.47 18 9 18z"/>
          <path fill="#FBBC05" d="M3.87 10.8c-.19-.58-.3-1.2-.3-1.8s.11-1.22.3-1.8L.97 4.94C.35 6.17 0 7.55 0 9s.35 2.83.97 4.06l2.9-2.26z"/>
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.47 0 2.45 2 1 4.94l2.9 2.26C4.59 5.05 6.62 3.58 9 3.58z"/>
        </svg>
        Sign in with Google
      </button>
    );
  }

  return <div ref={buttonDivRef} style={{ display: 'flex', justifyContent: 'center' }} />;
};

export default GoogleSignInButton;
