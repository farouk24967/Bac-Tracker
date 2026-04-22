import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Trophy } from 'lucide-react';

interface SubjectProgress {
  name: string;
  fullName: string;
  progress: number;
  isFinished: boolean;
  totalTasks: number;
  completedTasks: number;
  hasGoals: boolean;
  goalsCompleted: boolean;
}

interface SubjectRaceChartProps {
  data: SubjectProgress[];
  lang: 'ar' | 'fr' | 'en' | 'es';
}

const getSubjectStyles = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes('math')) return { bg: 'bg-blue-500', shadow: 'shadow-blue-100' };
  if (s.includes('physique')) return { bg: 'bg-purple-500', shadow: 'shadow-purple-100' };
  if (s.includes('science') || s.includes('علوم')) return { bg: 'bg-emerald-500', shadow: 'shadow-emerald-100' };
  if (s.includes('arabe') || s.includes('عربية')) return { bg: 'bg-red-500', shadow: 'shadow-red-100' };
  if (s.includes('islamique') || s.includes('إسلامية')) return { bg: 'bg-green-600', shadow: 'shadow-green-100' };
  if (s.includes('histoire') || s.includes('تاريخ')) return { bg: 'bg-amber-600', shadow: 'shadow-amber-100' };
  if (s.includes('philo') || s.includes('فلسفة')) return { bg: 'bg-primary-500', shadow: 'shadow-primary-100' };
  if (s.includes('français') || s.includes('فرنسية')) return { bg: 'bg-pink-500', shadow: 'shadow-pink-100' };
  if (s.includes('anglais') || s.includes('إنجليزية')) return { bg: 'bg-cyan-500', shadow: 'shadow-cyan-100' };
  return { bg: 'bg-slate-500', shadow: 'shadow-slate-100' };
};

export const SubjectRaceChart: React.FC<SubjectRaceChartProps> = ({ data, lang }) => {
  // Sort data by progress descending for the "race" ranking
  const sortedData = [...data].sort((a, b) => b.progress - a.progress);

  return (
    <div className="w-full space-y-5 py-4">
      <AnimatePresence mode="popLayout">
        {sortedData.map((subject, index) => {
          const styles = getSubjectStyles(subject.fullName);
          return (
            <motion.div
              key={subject.fullName}
              layout
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 40,
                delay: index * 0.05 
              }}
              className="flex items-center gap-4"
            >
              {/* Subject Label */}
              <div className="w-24 flex-shrink-0">
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-800 truncate text-right">
                  {subject.name || subject.fullName}
                </p>
              </div>

              {/* Bar Race */}
              <div className="flex-1 h-7 rounded-sm relative group bg-transparent">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.progress}%` }}
                  transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className={cn(
                    "h-full rounded-r-sm relative flex items-center shadow-sm",
                    styles.bg
                  )}
                />
                
                {/* Value on the right of the bar */}
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: `${subject.progress}%` }}
                  transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 ml-2 text-[10px] font-black text-slate-600 tabular-nums"
                >
                  {subject.progress}%
                </motion.span>
              </div>

              {/* Status Icons */}
              <div className="w-6 flex-shrink-0 flex justify-center">
                {subject.isFinished ? (
                   <Trophy className="w-4 h-4 text-yellow-500 fill-current" />
                ) : subject.progress > 0 ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                ) : (
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-[2px] bg-emerald-500" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Progression Max</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-5 bg-primary-50 rounded-full border border-primary-100" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Circuit Bac 2026</span>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
               {lang === 'ar' ? "تحديث مباشر" : "Live Rankings"}
            </p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
               {lang === 'ar' ? 'بناءً على التقدم الحالي' : 'Based on current progress'}
            </p>
         </div>
      </div>
    </div>
  );
};
