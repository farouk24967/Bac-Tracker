import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Play, Square, Timer, Award, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, Language } from '../types';
import { translations } from '../translations';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface StudySessionProps {
  userProfile: UserProfile;
  onStreakUpdate: () => void;
  onXPEarned?: (xp: number) => void;
  setIsManualActive?: (isActive: boolean) => void;
}

export const StudySession: React.FC<StudySessionProps> = ({ userProfile, onStreakUpdate, onXPEarned, setIsManualActive }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(1500); // Default 25 mins
  const [initialSeconds, setInitialSeconds] = useState(1500);
  const [showSummary, setShowSummary] = useState(false);

  const lang: Language = userProfile.language || 'fr';
  const t = translations[lang];

  const durations = [
    { label: '25m', value: 1500 },
    { label: '45m', value: 2700 },
    { label: '60m', value: 3600 },
    { label: '90m', value: 5400 },
  ];

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      handleStop();
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    setIsActive(true);
    setIsManualActive?.(true);
    const messages = {
      fr: t.session_started,
      en: t.session_started,
      ar: t.session_started,
      es: t.session_started
    };
    const path = 'notifications';
    try {
      await addDoc(collection(db, path), {
        uid: userProfile.uid,
        title: t.study_session + " ⏰",
        message: messages[lang],
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleStop = async () => {
    const timeStudied = initialSeconds - seconds;
    setIsActive(false);
    setIsManualActive?.(false);
    
    if (timeStudied > 10) { // Minimum 10 seconds for testing
      setShowSummary(true);
      
      const pointsEarned = Math.floor(timeStudied / 60) * 2 + 10;
      const today = new Date().toISOString().split('T')[0];
      
      const updates: any = {
        points: userProfile.points + pointsEarned
      };

      if (userProfile.lastActivityDate !== today) {
        updates.currentStreak = (userProfile.currentStreak || 0) + 1;
        updates.lastActivityDate = today;
        onStreakUpdate();
        updates.points = (updates.points || userProfile.points) + 50; // Daily bonus
      }

      try {
        await updateDoc(doc(db, 'users', userProfile.email), updates);

        // Save study session for analytics
        await addDoc(collection(db, 'studySessions'), {
          uid: userProfile.uid,
          duration: timeStudied,
          date: today,
          createdAt: new Date().toISOString()
        });

      // Add to activity log (Memory)
      await addDoc(collection(db, 'activityLog'), {
        uid: userProfile.uid,
        type: 'study_session',
        title: `Session d'étude : ${Math.floor(timeStudied / 60)} min`,
        subject: 'Général',
        timestamp: new Date().toISOString(),
        date: today,
        xpEarned: pointsEarned + (userProfile.lastActivityDate !== today ? 50 : 0)
      });

        const messages = {
          fr: t.session_finished.replace('{points}', pointsEarned.toString()),
          en: t.session_finished.replace('{points}', pointsEarned.toString()),
          ar: t.session_finished.replace('{points}', pointsEarned.toString()),
          es: t.session_finished.replace('{points}', pointsEarned.toString())
        };
        await addDoc(collection(db, 'notifications'), {
          uid: userProfile.uid,
          title: "Session terminée 🎉",
          message: messages[lang],
          type: 'success',
          read: false,
          createdAt: new Date().toISOString()
        });

        // Trigger parent XP reward if callback exists
        if (onXPEarned) {
          onXPEarned(pointsEarned + (userProfile.lastActivityDate !== today ? 50 : 0));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'multiple');
      }
    } else {
      setSeconds(initialSeconds);
    }
  };

  const selectDuration = (val: number) => {
    if (!isActive) {
      setSeconds(val);
      setInitialSeconds(val);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
        <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
          <Timer className={cn("w-8 h-8 text-primary-600", isActive && "animate-pulse")} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{t.study_session}</h3>
        
        <div className="flex gap-2 mb-6">
          {durations.map(d => (
            <button
              key={d.value}
              onClick={() => selectDuration(d.value)}
              disabled={isActive}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                initialSeconds === d.value 
                  ? "bg-primary-600 text-white" 
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
        
        <div className="text-4xl font-black text-slate-900 mb-8 font-mono tracking-wider">
          {formatTime(seconds)}
        </div>

        {!isActive ? (
          <button
            onClick={handleStart}
            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            {t.start_session}
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
          >
            <Square className="w-5 h-5 fill-current" />
            {t.stop_session}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="bg-emerald-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.great_job}</h2>
              <p className="text-slate-500 mb-8">{t.studied_for.replace('{minutes}', Math.floor((initialSeconds - seconds) / 60).toString())}</p>
              
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-center gap-2 mb-8">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-bold text-slate-900">+{Math.floor((initialSeconds - seconds) / 60) * 2 + 5} XP</span>
              </div>

              <button
                onClick={() => {
                  setShowSummary(false);
                  setSeconds(initialSeconds);
                }}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                Super !
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
