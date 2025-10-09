import { doc, getDoc, setDoc } from 'firebase/firestore';

import { db } from './firebase';

/**
 * Checks if user exists in user collection and updates their avatar with base64 data if not already present
 * @param email User's email (used as document ID)
 * @param photoURL URL of the user's profile photo from Google
 * @returns The base64 avatar string if user exists, throws error if not
 */
export async function checkUserExistsAndUpdateAvatar(
  email: string,
  photoURL: string | null
): Promise<string> {
  try {
    const userDocRef = doc(db, 'user', email);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      throw new Error('User not authorized. Please contact administrator.');
    }

    const userData = userDocSnap.data();
    const existingAvatar = userData?.avatar;

    // If avatar already exists, return it
    if (existingAvatar) {
      return existingAvatar;
    }

    if (!photoURL) {
      return '';
    }

    // Fetch the image and convert to base64
    const response = await fetch(photoURL);
    const blob = await response.blob();

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Update the user document with the avatar
    await setDoc(userDocRef, { avatar: base64 }, { merge: true });

    return base64;
  } catch (error) {
    console.error('Error checking user and updating avatar:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to verify user and update avatar');
  }
}
