import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  indexedDBLocalPersistence,
  initializeAuth,
  browserPopupRedirectResolver
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Auth with Persistence and Resolver specifically for Electron/Desktop support
const auth = (() => {
  // Check if we are in Electron or a browser environment that supports initializeAuth
  try {
    return initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver
    });
  } catch (e) {
    // Fallback for environments where initializeAuth might fail or already be initialized
    return getAuth(app);
  }
})();

export { auth };
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
export const logout = () => signOut(auth);
