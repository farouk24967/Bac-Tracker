import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Flame, Calendar, Info, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '../lib/utils';
import { 
  format, 
  eachDayOfInterval, 
  subDays, 
  isSameDay, 
  startOfToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  getDay,
  isSameMonth
} from 'date-fns';

import { fr, arDZ } from 'date-fns/locale';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';


interface ActivityHeatmapProps {
  sessions: any[];
  lang: string;
  userProfile: UserProfile;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ sessions, lang, userProfile }) => {

  const today = startOfToday();
  const [viewMode, setViewMode] = React.useState<'all' | 'month' | 'week'>('all');
  const [currentDate, setCurrentDate] = React.useState(today);


  const days = useMemo(() => {
    let start: Date;
    let end: Date;

    if (viewMode === 'all') {
      end = startOfToday();
      start = subDays(end, 119);
    } else if (viewMode === 'month') {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    } else {
      start = startOfWeek(currentDate, { weekStartsOn: 0 });
      end = endOfWeek(currentDate, { weekStartsOn: 0 });
    }

    return eachDayOfInterval({ start, end });
  }, [viewMode, currentDate]);


  const activityByDay = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(session => {
      const dateStr = session.date; // Expecting YYYY-MM-DD
      if (dateStr) {
        map[dateStr] = (map[dateStr] || 0) + (session.duration || 0);
      }
    });
    return map;
  }, [sessions]);

  const t = {
    fr: {
      title: "Tableau de Constance 3D",
      subtitle: "Chaque croix représente une journée d'étude intense.",
      legend: "Intensité",
      more: "Plus",
      less: "Moins",
      totalDays: "Jours actifs",
      streak: "Série actuelle"
    },
    ar: {
      title: "جدول الاستمرارية ثلاثي الأبعاد",
      subtitle: "كل علامة تمثل يوماً من الدراسة المكثفة.",
      legend: "الكثافة",
      more: "أكثر",
      less: "أقل",
      totalDays: "أيام النشاط",
      streak: "السلسلة الحالية",
      all: "الكل",
      month: "شهر",
      week: "أسبوع",
      prev: "السابق",
      next: "التالي"
    }
  }[lang === 'ar' ? 'ar' : 'fr'];
  
  const viewLabels = {
    fr: { all: "Tout", month: "Mois", week: "Semaine", prev: "Précédent", next: "Suivant" },
    ar: { all: "الكل", month: "شهر", week: "أسبوع", prev: "السابق", next: "التالي" }
  }[lang === 'ar' ? 'ar' : 'fr'];


  const getIntensity = (duration: number) => {
    if (duration === 0) return 0;
    if (duration < 3600) return 1; // < 1h
    if (duration < 7200) return 2; // < 2h
    if (duration < 14400) return 3; // < 4h
    return 4; // 4h+
  };

  const getBoxStyles = (intensity: number) => {
    switch (intensity) {
      case 0: return "bg-slate-100 dark:bg-slate-800 border-slate-200 shadow-inner";
      case 1: return "bg-emerald-100 border-emerald-200 text-emerald-600 shadow-sm";
      case 2: return "bg-emerald-300 border-emerald-400 text-emerald-700 shadow-md";
      case 3: return "bg-emerald-500 border-emerald-600 text-white shadow-lg";
      case 4: return "bg-emerald-600 border-emerald-700 text-white shadow-xl shadow-emerald-200/50 scale-105";
      default: return "bg-slate-100 border-slate-200";
    }
  };


  const handleSquareClick = async (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const existing = sessions.find(s => s.date === dateStr);
    
    if (existing) return; // Already has activity

    try {
      await addDoc(collection(db, 'studySessions'), {
        uid: userProfile.uid,
        date: dateStr,
        duration: 3600, // Default 1h for manual "cross"
        subjectId: 'Général',
        title: 'Session manuelle',
        createdAt: new Date().toISOString(),
        source: 'heatmap_manual'
      });
      
      // Also log to activityLog
      await addDoc(collection(db, 'activityLog'), {
        uid: userProfile.uid,
        date: dateStr,
        type: 'manual_log',
        title: 'Journée d\'étude marquée',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
    }
  };


  // Group days by weeks for the grid
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // Align start to the beginning of the week (Sunday = 0)
  const firstDayOffset = days.length > 0 ? getDay(days[0]) : 0;

  for (let i = 0; i < firstDayOffset; i++) {
    currentWeek.push(null as any);
  }

  days.forEach(day => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null as any);
    }
    weeks.push(currentWeek);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-6 md:p-8 rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative"
    >
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
        <div className="flex items-center gap-5">
          <div className="bg-emerald-600 p-4 rounded-3xl shadow-xl shadow-emerald-100 transform -rotate-6">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {viewMode === 'all' ? t.title : 
               viewMode === 'month' ? format(currentDate, 'MMMM yyyy', { locale: lang === 'ar' ? arDZ : fr }) :
               days.length > 0 ? `${format(days[0], 'd MMM', { locale: lang === 'ar' ? arDZ : fr })} - ${format(days[days.length-1], 'd MMM yyyy', { locale: lang === 'ar' ? arDZ : fr })}` : t.title}
            </h3>


            <p className="text-slate-500 text-sm font-medium">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {(['all', 'month', 'week'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  viewMode === mode 
                    ? "bg-white text-emerald-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {viewLabels[mode]}
              </button>
            ))}
          </div>

          {viewMode !== 'all' && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('prev')}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="sr-only">{viewLabels.prev}</span>
              </button>
              <button 
                onClick={() => navigate('next')}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
                <span className="sr-only">{viewLabels.next}</span>
              </button>

            </div>
          )}

          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-slate-700">
                {Object.keys(activityByDay).length} {t.totalDays}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* The 3D Grid */}
      <div className="overflow-x-auto pb-6 custom-scrollbar relative z-10">
        <div className="inline-flex flex-col gap-2 min-w-full">
          <div className="flex gap-2">
            {/* Week days labels (hidden on small screens if too cramped) */}
            <div className="flex flex-col gap-2 pr-2 justify-between py-1 opacity-40">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                <span key={d} className="text-[10px] font-black w-4 text-center">{d}</span>
              ))}
            </div>

            <div className="flex gap-2">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-2">
                  {week.map((day, dayIdx) => {
                    if (!day) return <div key={dayIdx} className="w-6 h-6 md:w-8 md:h-8" />;
                    
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const duration = activityByDay[dateStr] || 0;
                    const intensity = getIntensity(duration);
                    
                    return (
                      <motion.div
                        key={dayIdx}
                        initial={{ scale: 0, rotateY: 90 }}
                        whileInView={{ scale: 1, rotateY: 0 }}
                        transition={{ 
                          delay: (weekIdx * 0.02) + (dayIdx * 0.01),
                          type: "spring",
                          stiffness: 260,
                          damping: 20
                        }}
                        viewport={{ once: true }}
                        whileHover={{ 
                          scale: 1.2, 
                          z: 50,
                          rotateX: 10,
                          rotateY: 10,
                          transition: { duration: 0.2 }
                        }}
                        className={cn(
                          "w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl border shadow-sm flex items-center justify-center transition-colors cursor-pointer relative group/cell",
                          getBoxStyles(intensity),
                          "transform-gpu preserve-3d"
                        )}
                        onClick={() => handleSquareClick(day)}
                        title={`${format(day, 'PPP', { locale: lang === 'ar' ? arDZ : fr })}: ${Math.round(duration / 60)} min`}
                      >

                        {/* 3D Sides (Pseudo-elements for depth) */}
                        <div className="absolute inset-0 rounded-lg md:rounded-xl bg-black/5 transform translate-z-[-4px]" />
                        
                        {intensity > 0 && (
                          <X className={cn(
                            "w-3 h-3 md:w-4 md:h-4 stroke-[3px] transition-transform",
                            intensity >= 3 ? "text-white" : "text-emerald-600"
                          )} />
                        )}

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                          {format(day, 'EEEE d MMMM', { locale: lang === 'ar' ? arDZ : fr })} • {Math.round(duration / 60)}m
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
          <div className="bg-emerald-600 p-2 rounded-xl text-white">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">{t.streak}</p>
            <p className="text-xl font-black text-slate-900">12 Jours</p>
          </div>
        </div>
        
        <div className="p-4 bg-primary-50 rounded-3xl border border-primary-100 flex items-center gap-4">
          <div className="bg-primary-600 p-2 rounded-xl text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none mb-1">Mois en cours</p>
            <p className="text-xl font-black text-slate-900">
              {Object.keys(activityByDay).filter(d => d.startsWith(format(today, 'yyyy-MM'))).length} Activités
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-900 rounded-3xl flex items-center gap-4 text-white shadow-xl shadow-slate-200">
          <div className="bg-white/10 p-2 rounded-xl">
            <Info className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">Status</p>
            <p className="text-xl font-black">Major de Promo</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
