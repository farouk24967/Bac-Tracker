import { useEffect, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const useAutoStudyTime = (uid: string | undefined, isManualActive: boolean = false) => {
  const secondsRef = useRef(0);
  const lastSaveRef = useRef(Date.now());

  useEffect(() => {
    if (!uid) return;

    const interval = setInterval(() => {
      // Only count if window is visible AND no manual session is running (to avoid double counting)
      if (document.visibilityState === 'visible' && !isManualActive) {
        secondsRef.current += 1;
      }

      if (secondsRef.current >= 60) {
        saveTime();
      }
    }, 1000);

    const saveTime = async () => {
      // Don't save tiny chunks or if no uid or if user is logged out
      if (secondsRef.current < 10 || !uid || !auth.currentUser) return; 

      const timeToSave = secondsRef.current;
      secondsRef.current = 0;
      lastSaveRef.current = Date.now();

      try {
        await addDoc(collection(db, 'studySessions'), {
          uid,
          duration: timeToSave,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          type: 'passive'
        });
      } catch (error) {
        // Silently fail if permissions error occurs during logout transition
        if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
          console.warn("Auto study time save skipped due to logout transition.");
        } else {
          console.error("Error saving auto study time:", error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveTime();
      }
    };

    const handleBeforeUnload = () => {
      saveTime();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveTime();
    };
  }, [uid, isManualActive]);
};
