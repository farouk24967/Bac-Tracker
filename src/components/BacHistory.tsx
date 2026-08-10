import React from 'react';
import { History, GraduationCap, Clock, BarChart3, ChevronRight, CheckCircle2, Award } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { useBacSession } from '../hooks/useBacSession';
import { BacSession, parseDate } from '../lib/bacSessions';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface BacHistoryProps {
  userProfile: UserProfile;
  onViewAnalytics?: () => void;
}

export const BacHistory: React.FC<BacHistoryProps> = ({ userProfile, onViewAnalytics }) => {
  const lang: Language = userProfile.language || 'fr';
  const isAr = lang === 'ar';
  const { sessions, active, serverNow } = useBacSession();

  const daysUntil = (session: BacSession): number => {
    const now = serverNow();
    const start = parseDate(session.examStartDate);
    const end = parseDate(session.examEndDate);
    if (start !== null && now < start) {
      return Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    }
    if (end !== null && now < end) {
      return 0;
    }
    return 0;
  };

  const sorted = [...sessions].sort((a, b) => b.year - a.year);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
          <History className="w-8 h-8 text-primary-600" />
          {isAr ? 'دوراتي للبكالوريا' : 'Mes sessions BAC'}
        </h2>
        <p className="text-slate-500 mt-1">
          {isAr
            ? 'تتبع كل دورات البكالوريا، الحالية والسابقة.'
            : 'Suis toutes tes sessions BAC, actuelles et passées.'}
        </p>
      </div>

      <div className="space-y-6">
        {sorted.map((s) => {
          const isActive = active?.id === s.id;
          const end = parseDate(s.examEndDate);
          const isEnded = end !== null && serverNow() > end;
          const days = isActive ? daysUntil(s) : 0;

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-6 md:p-8 rounded-3xl md:rounded-[40px] border transition-all",
                isActive
                  ? "bg-slate-900 border-slate-800 text-white shadow-2xl"
                  : "bg-white border-slate-100 shadow-sm"
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    isActive ? "bg-primary-500/20 text-primary-400" : isEnded ? "bg-slate-50 text-slate-400" : "bg-primary-50 text-primary-600"
                  )}>
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={cn("text-xl md:text-2xl font-black", isActive ? "text-white" : "text-slate-900")}>
                      {isAr ? `بكالوريا ${s.year}` : `BAC ${s.year}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : isEnded
                            ? "bg-slate-100 text-slate-500"
                            : "bg-amber-50 text-amber-600"
                      )}>
                        {isActive
                          ? (isAr ? 'الدورة الحالية' : 'Session actuelle')
                          : isEnded
                            ? (isAr ? 'دورة منتهية' : 'Session terminée')
                            : (isAr ? 'قادمة' : 'À venir')}
                      </span>
                      {s.sourceVerified && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" />
                          {isAr ? 'مصدر موثوق' : 'Source vérifiée'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isActive ? (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{isAr ? 'المتبقي' : 'Restant'}</p>
                      <p className="text-lg font-black text-white">
                        {days > 0 ? `${days} ${isAr ? 'يوم' : 'jours'}` : (isAr ? 'جارية الآن' : 'En cours')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50">
                    <Award className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'المعدل' : 'Moyenne'}</p>
                      <p className="text-lg font-black text-slate-900">
                        {userProfile.currentAverage ? `${userProfile.currentAverage.toFixed(2)} / 20` : '--'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!isActive && isEnded && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onViewAnalytics}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-600 hover:gap-3 transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {isAr ? 'عرض الإحصائيات' : 'Voir les statistiques'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}

        {sorted.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
            <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">{isAr ? 'لا توجد دورات بعد.' : 'Aucune session pour le moment.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BacHistory;
