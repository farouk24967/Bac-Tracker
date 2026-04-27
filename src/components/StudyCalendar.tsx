import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Loader2, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Edit2,
  Plus,
  ExternalLink,
  Calendar as CalendarIconLucide,
  Sun,
  CloudSun,
  Moon,
  Filter
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { ScheduledSession, UserProfile, Language, Task, StudyGoal } from '../types';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { updateStreak, checkBadges } from '../lib/gamificationUtils';
import { generateStudySchedule } from '../services/geminiService';
import { StreakAnimation } from './StreakAnimation';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, subDays } from 'date-fns';
import { fr, arDZ, enUS, es } from 'date-fns/locale';

interface StudyCalendarProps {
  userProfile: UserProfile;
}

const getSubjectColor = (subject: string = '') => {
  const s = subject.toLowerCase();
  if (s.includes('math') || s.includes('رياضيات')) return { bg: 'bg-primary-50', border: 'border-primary-100', text: 'text-primary-700', marker: 'bg-primary-500' };
  if (s.includes('physique') || s.includes('فيزياء') || s.includes('تكنولوجيا')) return { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', marker: 'bg-sky-500' };
  if (s.includes('science') || s.includes('علوم الطبيعة') || s.includes('علوم طبيعية')) return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', marker: 'bg-emerald-500' };
  if (s.includes('philo') || s.includes('فلسفة')) return { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', marker: 'bg-purple-500' };
  if (s.includes('arabe') || s.includes('العربية') || s.includes('الأدب العربي')) return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', marker: 'bg-amber-500' };
  if (s.includes('français') || s.includes('الفرنسية')) return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', marker: 'bg-rose-500' };
  if (s.includes('anglais') || s.includes('english') || s.includes('الإنجليزية')) return { bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-700', marker: 'bg-pink-500' };
  if (s.includes('hist') || s.includes('geo') || s.includes('تاريخ') || s.includes('جغرافيا') || s.includes('اجتماعيات')) return { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', marker: 'bg-orange-500' };
  if (s.includes('islam') || s.includes('شريعة') || s.includes('إسلامية') || s.includes('علوم شرعية')) return { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-700', marker: 'bg-teal-500' };
  if (s.includes('compt') || s.includes('محاسبة') || s.includes('تسيير') || s.includes('قانون') || s.includes('اقتصاد')) return { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', marker: 'bg-violet-500' };
  if (s.includes('طريقة') || s.includes('طرائق') || s.includes('تقني')) return { bg: 'bg-lime-50', border: 'border-lime-100', text: 'text-lime-700', marker: 'bg-lime-500' };
  return { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', marker: 'bg-slate-500' };
};

export const StudyCalendar: React.FC<StudyCalendarProps> = ({ userProfile }) => {
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<ScheduledSession | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showStreakAnim, setShowStreakAnim] = useState(false);
  
  const [manualSession, setManualSession] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '08:00',
    duration: 60,
    description: '',
    subjectId: ''
  });

  const lang: Language = userProfile.language || 'fr';
  const t = translations[lang];
  
  const locales = { fr, ar: arDZ, en: enUS, es };
  const currentLocale = locales[lang] || fr;

  useEffect(() => {
    const sessionsPath = 'scheduledSessions';
    const qSessions = query(
      collection(db, sessionsPath),
      where('uid', '==', userProfile.uid),
      orderBy('date', 'asc')
    );

    const tasksPath = 'tasks';
    const qTasks = query(
      collection(db, tasksPath),
      where('uid', '==', userProfile.uid)
    );

    const goalsPath = 'studyGoals';
    const qGoals = query(
      collection(db, goalsPath),
      where('uid', '==', userProfile.uid)
    );

    const progressPath = 'subjectProgress';
    const qProgress = query(
      collection(db, progressPath),
      where('uid', '==', userProfile.uid)
    );

    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduledSession)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, sessionsPath);
    });

    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, tasksPath);
    });

    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyGoal)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, goalsPath);
    });

    const unsubProgress = onSnapshot(qProgress, (snapshot) => {
      setProgress(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, progressPath);
    });

    return () => {
      unsubSessions();
      unsubTasks();
      unsubGoals();
      unsubProgress();
    };
  }, [userProfile.uid]);

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      const newSessions = await generateStudySchedule(tasks, goals, userProfile, progress);
      
      // Save to Firestore
      for (const session of newSessions) {
        await addDoc(collection(db, 'scheduledSessions'), {
          ...session,
          uid: userProfile.uid,
          completed: false,
          createdAt: new Date().toISOString()
        });
      }
      setShowForm(false);
    } catch (error) {
      console.error("Error generating schedule:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSessionComplete = async (session: ScheduledSession) => {
    const newStatus = !session.completed;
    const path = 'scheduledSessions';
    try {
      await updateDoc(doc(db, path, session.id), {
        completed: newStatus
      });

      if (newStatus) {
        const today = new Date().toISOString().split('T')[0];
        const pointsEarned = 25;

        // Update user points
        const userRef = doc(db, 'users', userProfile.email);
        await updateDoc(userRef, {
          points: userProfile.points + pointsEarned
        });

        // Log activity
        await addDoc(collection(db, 'activityLog'), {
          uid: userProfile.uid,
          type: 'calendar_session',
          title: `Session terminée : ${session.title}`,
          subject: session.subjectId || 'Général',
          timestamp: new Date().toISOString(),
          date: today,
          xpEarned: pointsEarned + (userProfile.lastActivityDate !== today ? 50 : 0)
        });

        // Add to studySessions so it shows in the dashboard graph
        await addDoc(collection(db, 'studySessions'), {
          uid: userProfile.uid,
          duration: session.duration * 60, // convert minutes to seconds
          date: today,
          createdAt: new Date().toISOString(),
          source: 'calendar'
        });

        // Notification
        await addDoc(collection(db, 'notifications'), {
          uid: userProfile.uid,
          title: "Session terminée 🎉",
          message: lang === 'ar' ? `لقد ربحت ${pointsEarned} نقطة!` : `Tu as gagné ${pointsEarned} points !`,
          type: 'success',
          read: false,
          createdAt: new Date().toISOString()
        });

        // Trigger Streak Update
        const newStreak = await updateStreak(userProfile);
        if (newStreak > userProfile.currentStreak) {
          setShowStreakAnim(true);
        }

        // Check for specific badges related to calendar
        await checkBadges(userProfile, { action: 'session_finished' });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteSession = async (id: string) => {
    await deleteDoc(doc(db, 'scheduledSessions', id));
  };

  const handleAddManualSession = async () => {
    try {
      await addDoc(collection(db, 'scheduledSessions'), {
        ...manualSession,
        uid: userProfile.uid,
        completed: false,
        createdAt: new Date().toISOString()
      });
      setShowForm(false);
      setManualSession({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '08:00',
        duration: 60,
        description: '',
        subjectId: ''
      });
    } catch (error) {
      console.error("Error adding session:", error);
    }
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;
    try {
      const { id, ...data } = editingSession;
      await updateDoc(doc(db, 'scheduledSessions', id), data);
      setEditingSession(null);
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };

  const handleGoogleSync = () => {
    setIsSyncing(true);
    // In a real app, this would trigger OAuth flow
    // For now, we'll simulate a delay and show a message
    setTimeout(() => {
      setIsSyncing(false);
      alert(lang === 'ar' ? "تم ربط التقويم بنجاح (محاكاة)." : "Calendrier lié avec succès (simulation).");
    }, 2000);
  };

  const nextPeriod = () => {
    setCurrentDate(prev => view === 'week' ? addWeeks(prev, 1) : addDays(prev, 1));
  };

  const prevPeriod = () => {
    setCurrentDate(prev => view === 'week' ? subWeeks(prev, 1) : subDays(prev, 1));
  };

  const getPeriod = (time: string) => {
    if (!time) return 'morning';
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const days = view === 'week' 
    ? eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(currentDate, { weekStartsOn: 0 })
      })
    : [currentDate];

  return (
    <div className="space-y-6 pb-20">
      <StreakAnimation 
        streak={userProfile.currentStreak || 0} 
        isVisible={showStreakAnim} 
        onClose={() => setShowStreakAnim(false)} 
        lang={lang}
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary-600 p-3 rounded-2xl shadow-lg shadow-primary-100">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {lang === 'ar' ? "التقويم الذكي" : "Calendrier Intelligent"}
              </h2>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl ml-2">
                {[
                  { id: 'all', icon: Filter, label: { fr: 'Tout', ar: 'الكل' } },
                  { id: 'morning', icon: Sun, label: { fr: 'Matin', ar: 'صباحاً' } },
                  { id: 'afternoon', icon: CloudSun, label: { fr: 'A-M', ar: 'بعد الظهر' } },
                  { id: 'evening', icon: Moon, label: { fr: 'Soir', ar: 'مساءً' } },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedTimeFilter(f.id as any)}
                    title={lang === 'ar' ? f.label.ar : f.label.fr}
                    className={cn(
                      "p-1.5 rounded-lg transition-all flex items-center gap-1.5",
                      selectedTimeFilter === f.id 
                        ? "bg-white text-primary-600 shadow-sm" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                    )}
                  >
                    <f.icon className="w-3.5 h-3.5" />
                    {selectedTimeFilter === f.id && (
                      <span className="text-[10px] font-bold pr-1">
                        {lang === 'ar' ? f.label.ar : f.label.fr}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              {format(currentDate, 'MMMM yyyy', { locale: currentLocale })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-xl">
            <Clock className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-black text-primary-700">
              {Math.floor(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60)}h 
              {sessions.reduce((acc, s) => acc + (s.duration || 0), 0) % 60}m
            </span>
          </div>
          <button 
            onClick={() => setView('week')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              view === 'week' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            {lang === 'ar' ? "أسبوع" : "Semaine"}
          </button>
          <button 
            onClick={() => setView('day')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              view === 'day' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            {lang === 'ar' ? "يوم" : "Jour"}
          </button>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-4 rounded-[24px] font-bold shadow-xl shadow-primary-100 hover:bg-primary-700 transition-all group"
        >
          <Plus className="w-5 h-5" />
          {lang === 'ar' ? "إضافة حصة" : "Ajouter une session"}
        </button>

        <button
          onClick={handleGenerateSchedule}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 bg-white text-primary-600 border border-primary-100 px-6 py-4 rounded-[24px] font-bold shadow-sm hover:bg-primary-50 transition-all group disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          )}
          {lang === 'ar' ? "توليد برنامج ذكي (بكالوريا)" : "Générer planning IA (Bac)"}
        </button>

        <button
          onClick={handleGoogleSync}
          disabled={isSyncing}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-[24px] font-bold shadow-xl hover:bg-slate-800 transition-all group disabled:opacity-50"
        >
          {isSyncing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CalendarIconLucide className="w-5 h-5" />
          )}
          {lang === 'ar' ? "ربط مع Google" : "Lier à Google"}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
        <button onClick={prevPeriod} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <span className="font-bold text-slate-900">
          {view === 'week' 
            ? `${format(days[0], 'd MMM')} - ${format(days[6], 'd MMM yyyy')}`
            : format(currentDate, 'EEEE d MMMM yyyy', { locale: currentLocale })
          }
        </span>
        <button onClick={nextPeriod} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className={cn(
        "grid gap-4",
        view === 'week' ? "grid-cols-1 md:grid-cols-7" : "grid-cols-1"
      )}>
        {days.map((day, idx) => {
          const daySessions = sessions.filter(s => isSameDay(new Date(s.date), day));
          const isToday = isSameDay(day, new Date());

          return (
            <div key={idx} className={cn(
              "flex flex-col min-h-[200px] bg-white rounded-[32px] border transition-all",
              isToday ? "border-primary-200 ring-4 ring-primary-50" : "border-slate-100"
            )}>
              <div className={cn(
                "p-4 text-center border-b border-slate-50",
                isToday && "bg-primary-50/50"
              )}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {format(day, 'EEE', { locale: currentLocale })}
                </p>
                <p className={cn(
                  "text-xl font-black",
                  isToday ? "text-primary-600" : "text-slate-900"
                )}>
                  {format(day, 'd')}
                </p>
                {daySessions.length > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                    <Clock className="w-2.5 h-2.5 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-600">
                      {Math.floor(daySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60)}h 
                      {daySessions.reduce((acc, s) => acc + (s.duration || 0), 0) % 60}m
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                {daySessions.length > 0 ? (
                  (['morning', 'afternoon', 'evening'] as const)
                    .filter(period => selectedTimeFilter === 'all' || selectedTimeFilter === period)
                    .map((period) => {
                      const periodSessions = daySessions
                        .filter(s => getPeriod(s.startTime || '08:00') === period)
                        .sort((a, b) => (a.startTime || '08:00').localeCompare(b.startTime || '08:00'));
                      
                      if (periodSessions.length === 0) return null;

                    const periodLabels = {
                      morning: lang === 'ar' ? 'الصباح (08:00 - 12:00)' : 'Matin (08:00 - 12:00)',
                      afternoon: lang === 'ar' ? 'المساء (13:30 - 17:30)' : 'Après-midi (13:30 - 17:30)',
                      evening: lang === 'ar' ? 'الليل (19:00 - 22:30)' : 'Soir (19:00 - 22:30)'
                    };

                    return (
                      <div key={period} className="space-y-2">
                        <div className="flex items-center gap-2 px-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {periodLabels[period]}
                          </span>
                          <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        {periodSessions.map((session) => {
                          const colors = getSubjectColor(session.subjectId || session.title);
                          return (
                            <motion.div
                              key={session.id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={cn(
                                "p-4 rounded-3xl border transition-all duration-500 group relative overflow-hidden",
                                session.completed 
                                  ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50 opacity-80" 
                                  : `${colors.bg} ${colors.border} hover:shadow-lg hover:shadow-primary-50`
                              )}
                            >
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-2.5 h-2.5 rounded-full shadow-sm animate-pulse",
                                    session.completed ? "bg-emerald-400" : colors.marker
                                  )} />
                                  <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    session.completed ? "text-emerald-500" : "text-slate-400"
                                  )}>
                                    {session.startTime || '08:00'} • {session.duration} min
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button 
                                    onClick={() => setEditingSession(session)}
                                    className="p-1.5 text-slate-300 hover:text-primary-600 hover:bg-white rounded-lg transition-all"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => deleteSession(session.id)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="mb-2">
                                {session.subjectId && !session.title.includes(session.subjectId) && (
                                  <span className={cn(
                                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mb-1",
                                    session.completed ? "bg-emerald-100 text-emerald-600" : `${colors.marker} text-white opacity-80`
                                  )}>
                                    {session.subjectId}
                                  </span>
                                )}
                                <h4 className={cn(
                                  "text-sm font-black leading-tight",
                                  session.completed ? "text-emerald-800 line-through" : colors.text
                                )}>
                                  {session.title}
                                </h4>
                              </div>

                              {session.description && (
                                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                  {session.description}
                                </p>
                              )}
                              
                              <button
                                onClick={() => toggleSessionComplete(session)}
                                className={cn(
                                  "w-full py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden",
                                  session.completed 
                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" 
                                    : "bg-white border border-slate-100 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 shadow-sm"
                                )}
                              >
                                <AnimatePresence>
                                  {session.completed && (
                                    <>
                                      <motion.div
                                        key="check"
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 45 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        className="absolute left-[20%] md:left-[30%] z-10"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                      </motion.div>
                                      <motion.div
                                        key="ripple"
                                        initial={{ scale: 0.8, opacity: 0.8 }}
                                        animate={{ scale: 3, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="absolute inset-0 bg-emerald-400"
                                      />
                                    </>
                                  )}
                                </AnimatePresence>
                                <span className="relative z-10 font-black">
                                  {session.completed ? (
                                    lang === 'ar' ? "تم الإنجاز" : "Terminé"
                                  ) : (
                                    lang === 'ar' ? "إكمال الحصة" : "Compléter la session"
                                  )}
                                </span>
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-100 opacity-60">
                    <Clock className="w-8 h-8 text-slate-200 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {lang === 'ar' ? "مساحة حرة" : "Espace libre"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Generation / Add Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-8 md:p-10 max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-50 p-3 rounded-2xl">
                    <Plus className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {lang === 'ar' ? "حصة جديدة" : "Nouvelle Session"}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {lang === 'ar' ? "إضافة حصة مراجعة يدوياً" : "Ajoute manuellement une session"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                    {lang === 'ar' ? "العنوان" : "Titre"}
                  </label>
                  <input 
                    type="text" 
                    value={manualSession.title}
                    onChange={(e) => setManualSession({...manualSession, title: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={lang === 'ar' ? "مثال: مراجعة الرياضيات - الدوال" : "Ex: Révision Maths"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      {lang === 'ar' ? "التاريخ" : "Date"}
                    </label>
                    <input 
                      type="date" 
                      value={manualSession.date}
                      onChange={(e) => setManualSession({...manualSession, date: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      {lang === 'ar' ? "الساعة" : "Heure"}
                    </label>
                    <input 
                      type="time" 
                      value={manualSession.startTime}
                      onChange={(e) => setManualSession({...manualSession, startTime: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      {lang === 'ar' ? "المدة (دقائق)" : "Durée (min)"}
                    </label>
                    <input 
                      type="number" 
                      value={manualSession.duration}
                      onChange={(e) => setManualSession({...manualSession, duration: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      {lang === 'ar' ? "المادة" : "Matière"}
                    </label>
                    <input 
                      type="text" 
                      value={manualSession.subjectId}
                      onChange={(e) => setManualSession({...manualSession, subjectId: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={lang === 'ar' ? "رياضيات، علوم، فيزياء..." : "Maths, Physique..."}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                    {lang === 'ar' ? "الوصف" : "Description"}
                  </label>
                  <textarea 
                    value={manualSession.description}
                    onChange={(e) => setManualSession({...manualSession, description: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                    placeholder={lang === 'ar' ? "تفاصيل الحصة والدروس المراد مراجعتها..." : "Détails de la session..."}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    {lang === 'ar' ? "إلغاء" : "Annuler"}
                  </button>
                  <button
                    onClick={handleAddManualSession}
                    className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all"
                  >
                    {lang === 'ar' ? "إضافة" : "Ajouter"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingSession && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-8 md:p-10 max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-primary-600" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-50 p-3 rounded-2xl">
                    <Edit2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {lang === 'ar' ? "تعديل الحصة" : "Modifier Session"}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                    {lang === 'ar' ? "العنوان" : "Titre"}
                  </label>
                  <input 
                    type="text" 
                    value={editingSession.title}
                    onChange={(e) => setEditingSession({...editingSession, title: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      {lang === 'ar' ? "التاريخ" : "Date"}
                    </label>
                    <input 
                      type="date" 
                      value={editingSession.date}
                      onChange={(e) => setEditingSession({...editingSession, date: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      {lang === 'ar' ? "الساعة" : "Heure"}
                    </label>
                    <input 
                      type="time" 
                      value={editingSession.startTime || '08:00'}
                      onChange={(e) => setEditingSession({...editingSession, startTime: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      {lang === 'ar' ? "المدة (دقائق)" : "Durée (min)"}
                    </label>
                    <input 
                      type="number" 
                      value={editingSession.duration}
                      onChange={(e) => setEditingSession({...editingSession, duration: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                    {lang === 'ar' ? "الوصف" : "Description"}
                  </label>
                  <textarea 
                    value={editingSession.description}
                    onChange={(e) => setEditingSession({...editingSession, description: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditingSession(null)}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    {lang === 'ar' ? "إلغاء" : "Annuler"}
                  </button>
                  <button
                    onClick={handleUpdateSession}
                    className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all"
                  >
                    {lang === 'ar' ? "حفظ التغييرات" : "Enregistrer"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
