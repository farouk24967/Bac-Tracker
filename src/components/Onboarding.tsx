import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Stream, Language } from '../types';
import { STREAMS, SUBJECTS_BY_STREAM } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Heart, 
  Compass, 
  Search, 
  Zap,
  GraduationCap,
  Clock,
  Calendar,
  Brain
} from 'lucide-react';
import { cn } from '../lib/utils';
import { translations } from '../translations';

interface OnboardingProps {
  user: any;
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [lang] = useState<Language>('fr');
  const [passions, setPassions] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [universityGoal, setUniversityGoal] = useState('');
  const [source, setSource] = useState('');
  const [stream, setStream] = useState<Stream | ''>('');
  const [subjectTargets, setSubjectTargets] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ strengths: string[]; weaknesses: string[]; recommendedPlan: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const t = translations[lang].onboarding;
  const subjects = stream ? SUBJECTS_BY_STREAM[stream] : [];

  const handleNext = () => {
    if (step === 6) {
      generateAnalysis();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => setStep(s => s - 1);

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const generateAnalysis = () => {
    setIsAnalyzing(true);
    setStep(7);
    
    // Simulate AI analysis
    setTimeout(() => {
      const targets = Object.values(subjectTargets);
      const avgTarget = targets.length > 0 ? targets.reduce((a, b) => a + b, 0) / targets.length : 15;
      
      const strengths = passions.includes('Études') ? ['Motivation intrinsèque', 'Discipline'] : ['Curiosité', 'Adaptabilité'];
      const weaknesses = hobbies.includes('Réseaux sociaux') ? ['Gestion du temps', 'Distractions'] : ['Stress', 'Organisation'];
      
      const recommendedPlan = `Basé sur ton objectif de ${avgTarget.toFixed(1)}/20, tu dois prioriser les matières à fort coefficient de la filière ${stream}. Concentre-toi sur ${subjects[0]} et ${subjects[1]} pour maximiser tes chances.`;
      
      setAnalysis({ strengths, weaknesses, recommendedPlan });
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    const profile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'Étudiant',
      email: user.email || '',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      stream: stream as Stream,
      targetGrade: Object.values(subjectTargets).reduce((a, b) => a + b, 0) / subjects.length,
      points: 100,
      badges: ['starter'],
      favorites: [],
      onboardingCompleted: true,
      currentStreak: 0,
      createdAt: new Date().toISOString(),
      language: lang,
      passions,
      hobbies,
      universityGoal,
      discoverySource: source,
      subjectTargets,
      aiAnalysis: analysis || undefined
    };

    try {
      await setDoc(doc(db, 'users', user.uid), profile);
      onComplete(profile);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-100 overflow-hidden">
               <img 
                  src="/logo.png" 
                  alt="Bac Tracker Logo" 
                  className="w-full h-full object-contain scale-125"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                    e.currentTarget.parentElement?.classList.replace('bg-white', 'bg-slate-900');
                  }}
                />
              <Sparkles className="fallback-icon hidden w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              {t.welcome}
            </h2>
            <p className="text-slate-500 text-lg mb-10 font-medium leading-relaxed max-w-sm mx-auto">
              On va construire ensemble ton chemin vers la réussite au Bac.
            </p>
            <button
              onClick={handleNext}
              className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
            >
              C'est parti
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <Heart className="w-6 h-6 text-rose-500" />
                {t.passions_title}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {t.passions.map((p: string) => (
                  <button
                    key={p}
                    onClick={() => toggleSelection(p, passions, setPassions)}
                    className={cn(
                      "p-4 rounded-2xl font-bold text-sm transition-all border-2",
                      passions.includes(p) 
                        ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <Compass className="w-6 h-6 text-blue-500" />
                {t.hobbies_title}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {t.hobbies.map((h: string) => (
                  <button
                    key={h}
                    onClick={() => toggleSelection(h, hobbies, setHobbies)}
                    className={cn(
                      "p-4 rounded-2xl font-bold text-sm transition-all border-2",
                      hobbies.includes(h) 
                        ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-primary-500" />
                {t.university_title}
              </h3>
              <div className="space-y-3">
                {t.university.map((u: string) => (
                  <button
                    key={u}
                    onClick={() => setUniversityGoal(u)}
                    className={cn(
                      "w-full p-4 rounded-2xl font-bold text-sm text-left transition-all border-2 flex items-center justify-between",
                      universityGoal === u 
                        ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                    )}
                  >
                    {u}
                    {universityGoal === u && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3 leading-tight">
              <Search className="w-8 h-8 text-amber-500" />
              {t.source_title}
            </h3>
            <div className="space-y-3">
              {t.sources.map((s: string) => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={cn(
                    "w-full p-5 rounded-[24px] font-bold text-lg text-left transition-all border-2 flex items-center justify-between",
                    source === s 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                      : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                  )}
                >
                  {s}
                  {source === s && <Check className="w-6 h-6" />}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3 leading-tight">
              <BookOpen className="w-8 h-8 text-primary-500" />
              {t.stream_title}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {STREAMS.map(s => (
                <button
                  key={s}
                  onClick={() => setStream(s)}
                  className={cn(
                    "p-6 rounded-[28px] text-right border-2 transition-all font-black text-xl shadow-sm",
                    stream === s 
                      ? "border-slate-900 bg-slate-900 text-white shadow-xl scale-[1.02]" 
                      : "border-slate-100 bg-white text-slate-700 hover:border-slate-200"
                  )}
                  dir="rtl"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-3xl font-black text-slate-900 mb-4 flex items-center gap-3 leading-tight">
              <Zap className="w-8 h-8 text-yellow-500" />
              {t.subjects_title}
            </h3>
            <p className="text-slate-500 mb-8 font-medium">Voici les matières de ta filière :</p>
            <div className="grid grid-cols-1 gap-3">
              {subjects.map(s => (
                <div key={s} className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-lg" dir="rtl">{s}</span>
                  <div className="bg-green-100 p-2 rounded-full">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-3xl font-black text-slate-900 mb-4 flex items-center gap-3 leading-tight">
              <Target className="w-8 h-8 text-rose-500" />
              {t.targets_title}
            </h3>
            <p className="text-slate-500 mb-8 font-medium">Quelle note vises-tu pour chaque matière ?</p>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {subjects.map(s => (
                <div key={s} className="p-6 rounded-[28px] bg-white border-2 border-slate-100 space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-lg" dir="rtl">{s}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Note / 20</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    placeholder="Ex: 16"
                    value={subjectTargets[s] || ''}
                    onChange={(e) => setSubjectTargets({ ...subjectTargets, [s]: parseFloat(e.target.value) })}
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white transition-all outline-none font-bold text-xl"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="relative w-32 h-32 mx-auto mb-10">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 border-4 border-slate-100 border-t-slate-900 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-12 h-12 text-slate-900" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">{t.analyzing}</h3>
                  <p className="text-slate-500 font-medium">L'IA DzBac construit ton profil de réussite...</p>
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left">
                  <div className="bg-primary-600 p-8 rounded-[40px] text-white shadow-2xl shadow-primary-200">
                    <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                      <Sparkles className="w-6 h-6" />
                      Ton Profil Intelligent
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-3">Points Forts</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis?.strengths.map(s => (
                            <span key={s} className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-3">Points Faibles</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis?.weaknesses.map(w => (
                            <span key={w} className="bg-white/10 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/20">
                        <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-3">Plan Recommandé</p>
                        <p className="text-lg font-medium leading-relaxed italic">
                          "{analysis?.recommendedPlan}"
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
                  >
                    Suivant
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 8:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-50">
              <TrendingUp className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
              {t.marketing_title}
            </h2>
            <div className="space-y-4 mb-12 text-left max-w-xs mx-auto">
              {t.marketing_points.map((p: string) => (
                <div key={p} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="bg-white p-1.5 rounded-lg shadow-sm">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-bold text-slate-700">{p}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-6 bg-slate-900 text-white rounded-[28px] font-black text-xl shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
            >
              {loading ? "Préparation..." : t.access_dashboard}
              {!loading && <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />}
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white p-6 md:p-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Progress Header */}
      <div className="max-w-xl w-full mx-auto mb-12">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {step > 1 && step < 8 && (
              <button 
                onClick={handleBack}
                className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <span className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {t.step} {step} {t.of} 8
            </span>
          </div>
          <div className="flex gap-1.5">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i + 1 <= step ? "w-6 bg-slate-900" : "w-1.5 bg-slate-100"
                )} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 max-w-xl w-full mx-auto flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <div key={step}>
            {renderStep()}
          </div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      {step > 1 && step < 7 && (
        <div className="max-w-xl w-full mx-auto mt-12">
          <button
            onClick={handleNext}
            disabled={
              (step === 2 && (!universityGoal || passions.length === 0 || hobbies.length === 0)) ||
              (step === 3 && !source) ||
              (step === 4 && !stream) ||
              (step === 6 && Object.keys(subjectTargets).length < subjects.length)
            }
            className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:grayscale"
          >
            {t.next}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
