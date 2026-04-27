import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart, Area,
  PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Flame, 
  AlertTriangle, 
  CheckCircle2,
  ChevronRight,
  Zap,
  History,
  RotateCcw,
  Sparkles,
  Loader2,
  Save,
  PenLine
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Language, SubjectProgress, Task } from '../types';
import { SUBJECTS_BY_STREAM, STREAMS, COEFFICIENTS } from '../constants';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

import { generateDailyReport } from '../services/geminiService';
import Markdown from 'react-markdown';

interface AnalyticsProps {
  userProfile: UserProfile;
}

export const Analytics: React.FC<AnalyticsProps> = ({ userProfile }) => {
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const [dailyReport, setDailyReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [todayActivities, setTodayActivities] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  const lang: Language = userProfile.language || 'fr';
  const streamRaw = (userProfile.stream || STREAMS[0]).trim();
  const stream = STREAMS.find(s => s === streamRaw || s.toLowerCase() === streamRaw.toLowerCase()) || STREAMS[0];
  const subjects = SUBJECTS_BY_STREAM[stream] || [];

  useEffect(() => {
    const path = 'subjectProgress';
    const q = query(collection(db, path), where('uid', '==', userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProgress(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectProgress)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  useEffect(() => {
    const path = 'tasks';
    const q = query(
      collection(db, path), 
      where('uid', '==', userProfile.uid),
      orderBy('dueDate', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  useEffect(() => {
    const path = 'studySessions';
    const q = query(
      collection(db, path), 
      where('uid', '==', userProfile.uid),
      orderBy('date', 'desc'),
      limit(30)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudySessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const path = 'activityLog';
    const q = query(
      collection(db, path),
      where('uid', '==', userProfile.uid),
      where('date', '==', today),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodayActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const report = await generateDailyReport(userProfile, todayActivities, lang);
    setDailyReport(report);
    setIsGeneratingReport(false);
  };

  // Data Processing
  const getSubjectColor = (val: number) => {
    if (val >= 70) return '#10b981'; // Emerald-500
    if (val >= 40) return '#f59e0b'; // Amber-500
    return '#ef4444'; // Red-500
  };

  const subjectData = subjects.map(s => {
    const p = progress.find(item => item.subjectId === s)?.progress || 0;
    const grade = userProfile.currentGrades?.[s] || 0;
    return { name: s, progress: p, grade, color: getSubjectColor(p) };
  });

  const getRealAverage = () => {
    const grades = userProfile.currentGrades || {};
    const streamCoeffs = COEFFICIENTS[stream] || {};
    
    let totalWeightedGrade = 0;
    let totalCoeffs = 0;
    let gradeCount = 0;

    subjects.forEach(s => {
      if (grades[s] !== undefined && grades[s] !== null) {
        const coeff = streamCoeffs[s] || 1;
        totalWeightedGrade += grades[s] * coeff;
        totalCoeffs += coeff;
        gradeCount++;
      }
    });

    if (totalCoeffs === 0) return userProfile.currentAverage || 0;
    return totalWeightedGrade / totalCoeffs;
  };

  const realAverage = getRealAverage();

  const getRangeDays = () => {
    switch(timeRange) {
      case 'day': return 1;
      case 'week': return 7;
      case 'month': return 30;
      default: return 7;
    }
  };

  const currentRangeDays = [...Array(getRangeDays())].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const disciplineData = currentRangeDays.map(date => {
    const dayTasks = tasks.filter(t => t.dueDate.split('T')[0] === date);
    const completed = dayTasks.filter(t => t.completed).length;
    const percentage = dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0;
    return { 
      date: date.split('-').slice(1).join('/'), 
      percentage,
      fullDate: date
    };
  });

  const studyTimeData = currentRangeDays.map(date => {
    const daySessions = studySessions.filter(s => s.date === date);
    const totalSeconds = daySessions.reduce((acc, curr) => acc + curr.duration, 0);
    return { 
      date: date.split('-').slice(1).join('/'), 
      hours: Number((totalSeconds / 3600).toFixed(1)),
      minutes: Math.round(totalSeconds / 60),
      fullDate: date
    };
  });

  const goalData = currentRangeDays.map((date, i) => ({
    date: date.split('-').slice(1).join('/'),
    goal: userProfile.targetGrade || 15,
    current: (userProfile.currentAverage || 10) + (i * 0.05), // Adjusted simulated progress
    fullDate: date
  }));

  const subjectDistribution = subjects.map(s => {
    const daySessions = studySessions.filter(sess => sess.subjectId === s || sess.title?.includes(s));
    const totalSeconds = daySessions.reduce((acc, curr) => acc + curr.duration, 0);
    return { name: s, value: totalSeconds };
  }).filter(s => s.value > 0);

  const radarData = subjects.map(s => {
    const p = progress.find(item => item.subjectId === s)?.progress || 0;
    const isWeak = userProfile.aiAnalysis?.weaknesses?.includes(s) || p < 40;
    const isStrong = userProfile.aiAnalysis?.strengths?.includes(s) || p > 70;
    
    // Calculate a "mastery" score between 0 and 100
    let mastery = p;
    if (isStrong) mastery = Math.max(mastery, 80);
    if (isWeak) mastery = Math.min(mastery, 40);
    
    return { subject: s, A: mastery, fullMark: 100 };
  });

  const neglectedSubjects = subjects
    .map(s => {
      const lastTask = tasks.find(t => t.subject === s);
      const days = lastTask 
        ? Math.floor((Date.now() - new Date(lastTask.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        : 30; // Default to 30 if no task found
      return { name: s, days };
    })
    .filter(s => s.days > 3)
    .sort((a, b) => b.days - a.days);

  const resetAllProgress = async () => {
    const batch = progress.map(p => updateDoc(doc(db, 'subjectProgress', p.id), { progress: 0 }));
    await Promise.all(batch);
  };

  const t = {
    fr: {
      title: "Analytics & Performance",
      progression: "Progression par matière",
      discipline: "Discipline Journalière",
      studyTime: "Temps d'étude",
      studyTimeWeekly: "Evolution Hebdomadaire du temps d'étude",
      goalVsReality: "Objectif vs Réalité",
      streak: "Ta Continuité (Streak)",
      neglected: "Matières Négligées",
      prioritize: "Tu dois prioriser les matières en rouge",
      irregular: "Tu as été irrégulier cette semaine",
      increase: "Tu dois augmenter ton temps d'étude",
      far: "Tu es encore loin de ton objectif",
      dontBreak: "Ne casse pas ta streak !",
      neglecting: "Tu négliges certaines matières",
      day: "Jour",
      week: "Semaine",
      month: "Mois"
    },
    ar: {
      title: "التحليلات والأداء",
      progression: "التقدم حسب المادة",
      discipline: "الانضباط اليومي",
      studyTime: "وقت الدراسة",
      studyTimeWeekly: "تطور وقت الدراسة الأسبوعي",
      goalVsReality: "الهدف مقابل الواقع",
      streak: "استمراريتك (Streak)",
      neglected: "المواد المهملة",
      prioritize: "يجب عليك إعطاء الأولوية للمواد باللون الأحمر",
      irregular: "لقد كنت غير منتظم هذا الأسبوع",
      increase: "يجب عليك زيادة وقت دراستك",
      far: "لا تزال بعيداً عن هدفك",
      dontBreak: "لا تكسر السلسلة!",
      neglecting: "أنت تهمل بعض المواد",
      day: "يوم",
      week: "أسبوع",
      month: "شهر"
    }
  }[lang === 'ar' ? 'ar' : 'fr'];

  return (
    <div className="space-y-6 md:space-y-8 pb-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">{t.title}</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Analyse tes efforts pour mieux réussir.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <div className="flex bg-white p-1 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm shrink-0">
            {(['day', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all capitalize",
                  timeRange === range 
                    ? "bg-primary-600 text-white shadow-md shadow-primary-100" 
                    : "text-slate-400 hover:text-primary-600 hover:bg-slate-50"
                )}
              >
                {t[range]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3 bg-white p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-primary-600 p-1.5 md:p-2 rounded-lg md:rounded-xl text-white">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className={cn("pr-2 md:pr-4", lang === 'ar' ? "pl-2 md:pl-4 pr-0" : "pr-2 md:pr-4")}>
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Global</p>
              <p className="text-sm md:text-lg font-black text-slate-900">{realAverage.toFixed(2)}</p>
            </div>
          </div>

          <button 
            onClick={resetAllProgress}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            {lang === 'ar' ? "إعادة ضبط الكل" : "Tout réinitialiser"}
          </button>
        </div>
      </div>

      {/* Prominent Study Time Evolution Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-slate-100"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-amber-100 p-3 md:p-4 rounded-2xl md:rounded-3xl text-amber-600">
              <Clock className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h3 className="text-lg md:text-2xl font-black text-slate-900">{t.studyTime}</h3>
              <p className="text-slate-500 text-xs md:text-sm">
                {timeRange === 'day' ? (lang === 'ar' ? 'وقت الدراسة اليوم' : "Temps d'étude aujourd'hui") :
                 timeRange === 'week' ? t.studyTimeWeekly : 
                 (lang === 'ar' ? 'تطور وقت الدراسة الشهري' : "Évolution mensuelle du temps d'étude")}
              </p>
            </div>
          </div>
          <div className="bg-slate-50 px-4 md:px-6 py-2.5 md:py-4 rounded-2xl md:rounded-3xl border border-slate-100 text-center">
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total {t[timeRange]}</p>
            <p className="text-xl md:text-2xl font-black text-slate-900">
              {studyTimeData.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1)}h
            </p>
          </div>
        </div>
        
        <div className="h-[250px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={studyTimeData}>
              <defs>
                <linearGradient id="colorStudyTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11 }}
                interval={timeRange === 'month' ? 4 : 0}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11 }} 
              />
              <Tooltip 
                cursor={{ stroke: '#f59e0b', strokeWidth: 2 }}
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: 'none', 
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                  padding: '16px' 
                }}
                formatter={(value: any) => [`${value} ${lang === 'ar' ? 'ساعة' : 'h'}`, t.studyTime]}
              />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="#f59e0b" 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#colorStudyTime)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Section 1: Progression par matière */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-primary-50 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-primary-600">
                <Target className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900">{t.progression}</h3>
            </div>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="vertical" margin={{ left: lang === 'ar' ? 0 : 20, right: lang === 'ar' ? 20 : 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} width={60} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="progress" radius={[0, 10, 10, 0]} barSize={16} minPointSize={5}>
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {subjectData.some(s => s.progress < 40) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 md:mt-6 p-3 md:p-4 bg-red-50 rounded-xl md:rounded-2xl border border-red-100 flex items-center gap-2 md:gap-3 overflow-hidden"
            >
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
              <p className="text-xs md:text-sm font-bold text-red-700">{t.prioritize}</p>
            </motion.div>
          )}
        </motion.div>

        {/* New Radar Chart: Force vs Faiblesse */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-purple-50 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-purple-600">
                <Zap className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900">{lang === 'ar' ? 'توازن المواد' : 'Équilibre des Matières'}</h3>
            </div>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <Radar
                  name="Maîtrise"
                  dataKey="A"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <p className="text-sm font-bold text-purple-700">
              {lang === 'ar' ? 'هنا ترى توزيع قوتك في جميع المواد.' : 'Visualise la maîtrise de chacune de tes matières.'}
            </p>
          </div>
        </motion.div>

        {/* Section 2: Discipline Journalière */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">{t.discipline}</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={disciplineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-bold text-amber-700">{t.irregular}</p>
          </div>
        </motion.div>

        {/* Section 4: Objectif vs Réalité */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">{t.goalVsReality}</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={goalData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 20]} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="stepAfter" dataKey="goal" stroke="#64748b" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="current" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-bold text-amber-700">{t.far}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 5: Streak */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-200 lg:col-span-1"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white/10 p-3 rounded-2xl">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-black">{t.streak}</h3>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-8">
            {[...Array(7)].map((_, i) => {
              const isActive = i < (userProfile.currentStreak || 0) % 7;
              return (
                <div 
                  key={i} 
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    isActive ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white/5 text-white/20"
                  )}
                >
                  <Flame className={cn("w-6 h-6", isActive ? "fill-current" : "")} />
                </div>
              );
            })}
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
              <span className="font-black">X</span>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-sm font-bold text-orange-400">{t.dontBreak}</p>
            <p className="text-2xl font-black mt-1">{userProfile.currentStreak || 0} Jours</p>
          </div>
        </motion.div>

        {/* Section Study Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 lg:col-span-1"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-sky-50 p-3 rounded-2xl text-sky-600">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">{lang === 'ar' ? 'توزيع الوقت' : 'Temps par Matière'}</h3>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subjectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'][index % 7]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${Math.round(value / 60)} min`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            {subjectDistribution.slice(0, 4).map((s, i) => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'][i % 7] }} />
                <span className="text-[10px] font-bold text-slate-500 truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section: Matières Faibles explicitly */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 lg:col-span-1"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">{lang === 'ar' ? 'مواد ضعيفة' : 'Matières Faibles'}</h3>
          </div>

          <div className="space-y-3">
            {(userProfile.aiAnalysis?.weaknesses || []).length > 0 ? userProfile.aiAnalysis?.weaknesses?.map((s: string) => (
              <div key={s} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <span className="font-bold text-slate-700 text-sm">{s}</span>
              </div>
            )) : (
              <p className="text-slate-400 text-xs text-center py-4 italic">Aucune matière marquée comme faible.</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 6: Matières négligées */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 lg:col-span-2"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-red-50 p-3 rounded-2xl text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">{t.neglected}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {neglectedSubjects.length > 0 ? neglectedSubjects.map(s => (
              <div key={s.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-red-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-10 bg-red-500 rounded-full" />
                  <div>
                    <p className="font-bold text-slate-800">{s.name}</p>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{s.days} jours sans révision</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </div>
            )) : (
              <div className="col-span-2 text-center py-12 bg-emerald-50 rounded-[32px] border border-emerald-100">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <p className="text-emerald-700 font-bold">Toutes les matières sont à jour !</p>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-slate-900 rounded-2xl text-white flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <p className="text-sm font-bold">{t.neglecting}</p>
          </div>
        </motion.div>
      </div>

      {/* Section 7: Mémoire / Activités */}
      {/* Daily AI Report Section */}
      <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {lang === 'ar' ? "تقرير الذكاء الاصطناعي اليومي" : "Rapport IA Quotidien"}
              </h3>
              <p className="text-slate-500 text-sm">
                {lang === 'ar' ? "تحليل ذكي ليومك الدراسي." : "Analyse intelligente de ta journée d'étude."}
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || todayActivities.length === 0}
            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-lg shadow-primary-100"
          >
            {isGeneratingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {lang === 'ar' ? "توليد التقرير" : "Générer le rapport"}
          </button>
        </div>

        {dailyReport ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 p-8 rounded-3xl border border-slate-100 prose prose-slate max-w-none"
          >
            <Markdown>{dailyReport}</Markdown>
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">
              {todayActivities.length > 0 
                ? (lang === 'ar' ? "اضغط على الزر أعلاه لتحليل أنشطتك اليومية." : "Clique sur le bouton ci-dessus pour analyser tes activités du jour.")
                : (lang === 'ar' ? "لم يتم تسجيل أي نشاط اليوم بعد." : "Aucune activité enregistrée aujourd'hui pour le moment.")
              }
            </p>
          </div>
        )}
      </section>

      <ActivityMemory userProfile={userProfile} lang={lang} />

      <GradeManager userProfile={userProfile} lang={lang} stream={stream} subjects={subjects} />
    </div>
  );
};

const GradeManager: React.FC<{ userProfile: UserProfile, lang: Language, stream: string, subjects: string[] }> = ({ userProfile, lang, stream, subjects }) => {
  const [localGrades, setLocalGrades] = useState<Record<string, number>>(userProfile.currentGrades || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Calculate weighted average
      const streamCoeffs = COEFFICIENTS[stream] || {};
      let totalWeightedGrade = 0;
      let totalCoeffs = 0;
      
      subjects.forEach(s => {
        if (localGrades[s] !== undefined && localGrades[s] !== null) {
          const coeff = streamCoeffs[s] || 1;
          totalWeightedGrade += localGrades[s] * coeff;
          totalCoeffs += coeff;
        }
      });

      const newAverage = totalCoeffs > 0 ? totalWeightedGrade / totalCoeffs : 0;

      await updateDoc(doc(db, 'users', userProfile.email), {
        currentGrades: localGrades,
        currentAverage: newAverage
      });
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving grades:", error);
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-rose-50 p-3 rounded-2xl text-rose-600">
            <PenLine className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {lang === 'ar' ? "نقاطي (معدلات المواد)" : "Mes Notes (Moyennes)"}
            </h3>
            <p className="text-slate-500 text-sm">
              {lang === 'ar' ? "أدخل نقاطك في كل مادة لحساب معدلك العام." : "Saisis tes notes pour affiner tes analyses."}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {lang === 'ar' ? "حفظ النقاط" : "Enregistrer les notes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map(subject => {
          const coeff = (COEFFICIENTS[stream] || {})[subject] || 1;
          return (
            <div key={subject} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-sm" dir="rtl">{subject}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coeff: {coeff}</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.01"
                  value={localGrades[subject] || ''}
                  onChange={(e) => setLocalGrades({ ...localGrades, [subject]: parseFloat(e.target.value) })}
                  className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">/ 20</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const ActivityMemory: React.FC<{ userProfile: UserProfile, lang: Language }> = ({ userProfile, lang }) => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const path = 'activityLog';
    const q = query(
      collection(db, path), 
      where('uid', '==', userProfile.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">{lang === 'ar' ? "ذاكرة الأنشطة" : "Mémoire des Activités"}</h3>
        </div>
        <span className="text-xs font-bold text-slate-400">{dateStr}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logs.length > 0 ? logs.map(log => (
          <div key={log.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="bg-white p-2 rounded-xl shadow-sm mt-1">
              {log.type === 'task_completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-primary-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {log.type === 'task_completed' 
                  ? (lang === 'ar' ? `أكملت: ${log.title}` : `Terminé : ${log.title}`)
                  : log.title
                }
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.subject}</span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  +{log.xpEarned || 0} XP
                </span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-slate-400 font-medium italic">Aucun souvenir enregistré.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
