import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Language, UserProfile } from '../types';
import { useBacSession } from '../hooks/useBacSession';
import { BacSession } from '../lib/bacSessions';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface BacCountdownProps {
  lang: Language;
  userProfile?: UserProfile | null;
}

const CountdownCircle = ({ value, max, label, color, isDark }: { value: number, max: number, label: string, color: string, isDark?: boolean }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className={isDark ? "stroke-white/10" : "stroke-slate-100"}
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center -space-y-0.5">
          <span className={cn("text-[8px] sm:text-[10px] font-bold uppercase tracking-tighter sm:tracking-normal", isDark ? "text-white/40" : "text-slate-400")}>{label}</span>
          <span className={cn("text-lg sm:text-2xl font-black tabular-nums", isDark ? "text-white" : "text-slate-800")}>{value}</span>
        </div>
      </div>
    </div>
  );
};

const getDiff = (target: number, now: number) => {
  const diff = Math.max(target - now, 0);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
};

export const BacCountdown: React.FC<BacCountdownProps> = ({ lang, userProfile }) => {
  const { active, previous, next, serverOffset, sessions } = useBacSession();
  const [now, setNow] = useState(Date.now() + serverOffset);
  const prevActiveYear = useRef<number | null>(null);
  const notifiedKey = useRef<string>('');

  useEffect(() => {
    setNow(Date.now() + serverOffset);
    const timer = setInterval(() => {
      setNow(Date.now() + serverOffset);
    }, 1000);
    return () => clearInterval(timer);
  }, [serverOffset]);

  const isAr = lang === 'ar';

  // ---------- Transition automatique + notification unique ----------
  useEffect(() => {
    if (!active) return;
    const year = active.year;
    const prevYear = prevActiveYear.current;
    prevActiveYear.current = year;

    if (prevYear !== null && year > prevYear && notifiedKey.current !== `${prevYear}->${year}`) {
      notifiedKey.current = `${prevYear}->${year}`;
      notifyTransition(prevYear, year);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.year]);

  const notifyTransition = async (fromYear: number, toYear: number) => {
    if (!userProfile?.uid) return;
    const key = `${userProfile.uid}_${fromYear}_${toYear}`;
    try {
      const q = query(
        collection(db, 'session_transition_notifications'),
        where('uid', '==', userProfile.uid),
        where('key', '==', key),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) return;

      await addDoc(collection(db, 'session_transition_notifications'), {
        uid: userProfile.uid,
        key,
        fromYear,
        toYear,
        createdAt: new Date().toISOString(),
      });

      await addDoc(collection(db, 'notifications'), {
        uid: userProfile.uid,
        title: isAr ? '🎓 بداية دورة جديدة للبكالوريا' : '🎓 Nouvelle session BAC',
        message: isAr
          ? `انتهت دورة بكالوريا ${fromYear}. الدورة التالية المتاحة الآن هي بكالوريا ${toYear}. يبقى سجلّك لبكالوريا ${fromYear} متاحاً في السجل.`
          : `Le BAC ${fromYear} est terminé. La prochaine session disponible est maintenant le BAC ${toYear}. Votre historique BAC ${fromYear} reste disponible.`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[BacCountdown] transition notification non envoyée :', e);
    }
  };

  const labels = isAr
    ? { d: 'يوم', h: 'ساعة', m: 'دقيقة', s: 'ثانية' }
    : { d: 'jours', h: 'heur', m: 'min', s: 'sec' };

  let target: number | null = null;
  let mode: 'upcoming' | 'in_progress' | 'ended' = 'upcoming';
  const session = active;

  if (session) {
    const start = new Date(session.examStartDate).getTime();
    const end = new Date(session.examEndDate).getTime();
    if (now < start) {
      mode = 'upcoming';
      target = start;
    } else if (now <= end) {
      mode = 'in_progress';
      target = end;
    } else {
      mode = 'ended';
    }
  } else {
    mode = 'ended';
  }

  const timeLeft = target !== null ? getDiff(target, now) : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const endedSession = session || previous;

  const title = session
    ? `BAC ${session.year}`
    : endedSession
      ? `BAC ${endedSession.year}`
      : 'BAC';

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 md:p-8 rounded-3xl md:rounded-[40px] shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[220px]">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-600/20 via-transparent to-emerald-600/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-700" />

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${title}-${mode}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-6 md:mb-8">
              <CountdownCircle value={timeLeft.days} max={365} label={labels.d} color="#fbbf24" isDark />
              <CountdownCircle value={timeLeft.hours} max={24} label={labels.h} color="#38bdf8" isDark />
              <CountdownCircle value={timeLeft.minutes} max={60} label={labels.m} color="#34d399" isDark />
              <CountdownCircle value={timeLeft.seconds} max={60} label={labels.s} color="#2dd4bf" isDark />
            </div>

            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-6 md:w-8 bg-white/10" />
                <p className="text-[8px] md:text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">
                  {mode === 'in_progress'
                    ? (isAr ? `🎓 بكالوريا ${session?.year} جارية` : `🎓 BAC ${session?.year} EN COURS`)
                    : mode === 'ended'
                      ? (isAr ? '✅ الدورة منتهية' : '✅ SESSION TERMINÉE')
                      : title}
                </p>
                <div className="h-px w-6 md:w-8 bg-white/10" />
              </div>

              {mode === 'upcoming' && (
                <>
                  <p className="text-[10px] md:text-[13px] text-slate-400 font-medium leading-relaxed px-4">
                    {isAr ? 'المتبقي قبل بداية الامتحانات:' : 'Il reste avant le début des examens :'}
                  </p>
                  <p className="text-xs md:text-md font-black text-white bg-white/5 py-1.5 md:py-2 px-3 md:px-4 rounded-xl md:rounded-2xl border border-white/5 inline-block">
                    {new Date(session!.examStartDate).toLocaleDateString(isAr ? 'ar-DZ' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </>
              )}

              {mode === 'in_progress' && (
                <p className="text-[10px] md:text-[13px] text-emerald-400 font-bold leading-relaxed px-4">
                  {isAr ? '🚀 حظاً موفقاً! الامتحانات جارية الآن.' : '🚀 Bonne chance ! Les épreuves sont en cours.'}
                </p>
              )}

              {mode === 'ended' && next && (
                <p className="text-[10px] md:text-[13px] text-slate-400 font-medium leading-relaxed px-4">
                  {isAr
                    ? `الدورة التالية: بكالوريا ${next.year}`
                    : `Prochaine session : BAC ${next.year}`}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BacCountdown;
