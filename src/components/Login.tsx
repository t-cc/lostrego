import GoogleIcon from '@/assets/icons/google.svg?react';
import { Button } from '@/components/ui/button';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

function signInWithGoogle() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      console.log('User signed in:', result.user);
    })
    .catch((error) => {
      console.error('Error signing in:', error);
    });
}

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button onClick={signInWithGoogle} className="flex items-center gap-2">
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
}
