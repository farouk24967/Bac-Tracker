import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { getAuth, GoogleAuthProvider as FirebaseGoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Use browser local persistence (standard for web)
setPersistence(auth, browserLocalPersistence);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google (Web + Mobile version)
 */
export const signInWithGoogle = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Native Google Sign In for Android/iOS
      const result = await FirebaseAuthentication.signInWithGoogle();
      
      if (result.credential) {
        const credential = FirebaseGoogleAuthProvider.credential(
          result.credential.idToken,
          result.credential.accessToken
        );
        return await signInWithCredential(auth, credential);
      }
      throw new Error('No credential returned from native Google sign-in');
    } else {
      // Standard Popup for Web/Electron
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    }
  } catch (error: any) {
    console.error('[Auth] Error:', error.code, error.message);
    throw error;
  }
};

export const logout = () => signOut(auth);

export { auth, db, googleProvider, onAuthStateChanged };
