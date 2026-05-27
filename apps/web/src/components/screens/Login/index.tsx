import { useState } from 'react';

import GoogleIcon from '@/assets/icons/google.svg?react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

function signInWithGoogle() {
  signInWithPopup(auth, googleProvider)
    // .then((result) => {
    //   console.log('User signed in:', result.user);
    // })
    .catch((error) => {
      console.error('Error signing in:', error);
    });
}

export function Login() {
  const { loading, error, clearError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    // Clear any existing error before attempting login
    clearError();
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <Button
          onClick={handleGoogleSignIn}
          disabled={loading || signingIn}
          className="flex items-center gap-2 mx-auto "
        >
          <GoogleIcon className="h-4 w-4" />
          {signingIn || loading ? 'Signing in...' : 'Continue with Google'}
        </Button>
      </div>
    </div>
  );
}
