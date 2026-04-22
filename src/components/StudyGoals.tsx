import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  Loader2
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
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { StudyGoal, UserProfile, Language } from '../types';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { checkBadges, BADGE_DEFINITIONS } from '../lib/gamificationUtils';

interface StudyGoalsProps {
  userProfile: UserProfile;
  subjects: string[];
  onXPEarned?: (xp: number) => void;
}

export const StudyGoals: React.FC<StudyGoalsProps> = ({ userProfile, subjects, onXPEarned }) => {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    period: 'weekly' as 'weekly' | 'monthly',
    targetValue: 5,
    unit: 'chapitres',
    subject: ''
  });

  const lang: Language = userProfile.language || 'fr';
  const t = translations[lang];

  useEffect(() => {
    const path = 'studyGoals';
    const q = query(
      collection(db, path),
      where('uid', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyGoal)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [userProfile.uid]);

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return;

    try {
      await addDoc(collection(db, 'studyGoals'), {
        uid: userProfile.uid,
        title: newGoal.title,
        period: newGoal.period,
        targetValue: Number(newGoal.targetValue),
        currentValue: 0,
        unit: newGoal.unit,
        subject: newGoal.subject || null,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewGoal({ title: '', period: 'weekly', targetValue: 5, unit: 'chapitres', subject: '' });
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const updateGoalProgress = async (id: string, current: number, target: number) => {
    if (current >= target) return;
    const nextVal = current + 1;
    await updateDoc(doc(db, 'studyGoals', id), {
      currentValue: nextVal
    });

    if (nextVal >= target) {
      const reachedCount = goals.filter(g => g.currentValue >= g.targetValue).length + 1;
      const awarded = await checkBadges(userProfile, { 
        action: 'goal_reached', 
        metadata: { totalGoalsReached: reachedCount } 
      });

      if (awarded.length > 0 && onXPEarned) {
        let sum = 0;
        awarded.forEach(id => {
          const def = BADGE_DEFINITIONS.find(b => b.id === id);
          if (def) sum += def.points;
        });
        onXPEarned(sum);
      }
    }
  };

  const deleteGoal = async (id: string) => {
    await deleteDoc(doc(db, 'studyGoals', id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-xl">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">{t.study_goals}</h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t.add_goal}</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-6 rounded-3xl border-2 border-primary-100 shadow-xl space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.goal_title}</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Ex: Réviser la physique"
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Période</label>
                <div className="flex gap-2">
                  {(['weekly', 'monthly'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewGoal({ ...newGoal, period: p })}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                        newGoal.period === p ? "bg-primary-600 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      {p === 'weekly' ? t.weekly : t.monthly}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'ar' ? 'المادة' : 'Matière'}</label>
                <select
                  value={newGoal.subject}
                  onChange={(e) => setNewGoal({ ...newGoal, subject: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none font-bold text-slate-600"
                >
                  <option value="">{lang === 'ar' ? 'هدف عام' : 'Objectif global'}</option>
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.target_value}</label>
                <input
                  type="number"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.unit}</label>
                <input
                  type="text"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                  placeholder="Ex: chapitres"
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleAddGoal}
                className="flex-1 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all"
              >
                Confirmer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : goals.length > 0 ? (
          goals.map((goal) => {
            const progress = (goal.currentValue / goal.targetValue) * 100;
            const isCompleted = goal.currentValue >= goal.targetValue;

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group relative",
                  isCompleted && "bg-emerald-50/30 border-emerald-100"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-primary-50 text-primary-600"
                    )}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{goal.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {goal.period === 'weekly' ? t.weekly : t.monthly}
                        </span>
                        {goal.subject && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-lg">
                              {goal.subject}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-600">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className={cn(
                      "text-sm font-bold",
                      isCompleted ? "text-emerald-600" : "text-primary-600"
                    )}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      className={cn(
                        "h-full rounded-full",
                        isCompleted ? "bg-emerald-500" : "bg-primary-600"
                      )}
                    />
                  </div>
                </div>

                {!isCompleted && (
                  <button
                    onClick={() => updateGoalProgress(goal.id, goal.currentValue, goal.targetValue)}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-primary-50 hover:text-primary-600 transition-all border border-transparent hover:border-primary-100"
                  >
                    Mettre à jour
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">{t.no_goals}</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 text-primary-600 font-bold text-sm hover:underline"
            >
              {t.add_goal}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
