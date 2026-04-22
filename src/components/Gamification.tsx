import React from 'react';
import { Trophy, Star, Award, Zap, Target, Shield, Flame, Medal, Moon, Sunrise } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, Language } from '../types';
import { translations } from '../translations';

interface GamificationProps {
  userProfile: UserProfile;
}

const BADGES = [
  { id: 'starter', name: { fr: 'Nouveau Bachelier', en: 'New Student', ar: 'طالب جديد', es: 'Nuevo Estudiante' }, icon: Star, color: 'text-blue-500', bg: 'bg-blue-50', description: { fr: 'A rejoint la plateforme DzBac.', en: 'Joined the DzBac platform.', ar: 'انضم إلى منصة DzBac.', es: 'Se unió a la plataforma DzBac.' } },
  { id: 'planner', name: { fr: 'Maître du Planning', en: 'Planning Master', ar: 'سيد التخطيط', es: 'Maestro del Plan' }, icon: Target, color: 'text-purple-500', bg: 'bg-purple-50', description: { fr: 'A créé ses premières tâches.', en: 'Created their first tasks.', ar: 'أنشأ مهامه الأولى.', es: 'Creó sus primeras tareas.' } },
  { id: 'consistent', name: { fr: 'Sérieux & Rigoureux', en: 'Serious & Rigorous', ar: 'جاد ومنضبط', es: 'Serio y Riguroso' }, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', description: { fr: 'A complété 10 tâches.', en: 'Completed 10 tasks.', ar: 'أكمل 10 مهام.', es: 'Completó 10 tareas.' } },
  { id: 'weekly_warrior', name: { fr: 'Guerrier Hebdomadaire', en: 'Weekly Warrior', ar: 'محارب الأسبوع', es: 'Guerrero Semanal' }, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50', description: { fr: 'A complété 20 tâches en une semaine.', en: 'Completed 20 tasks in a week.', ar: 'أكمل 20 مهمة في أسبوع واحد.', es: 'Completó 20 tareas en una semana.' } },
  { id: 'goal_crusher', name: { fr: 'Briseur d\'Objectifs', en: 'Goal Crusher', ar: 'محطم الأهداف', es: 'Rompe Objetivos' }, icon: Target, color: 'text-red-500', bg: 'bg-red-50', description: { fr: 'A atteint 5 objectifs d\'étude.', en: 'Reached 5 study goals.', ar: 'حقق 5 أهداف دراسية.', es: 'Alcanzó 5 objetivos de estudio.' } },
  { id: 'night_owl', name: { fr: 'Oiseau de Nuit', en: 'Night Owl', ar: 'بومة الليل', es: 'Búho Nocturno' }, icon: Moon, color: 'text-primary-400', bg: 'bg-primary-50', description: { fr: 'A étudié après 23h.', en: 'Studied after 11 PM.', ar: 'درس بعد الساعة 11 مساءً.', es: 'Estudió después de las 23h.' } },
  { id: 'early_bird', name: { fr: 'Lève-tôt', en: 'Early Bird', ar: 'الطائر المبكر', es: 'طائر الصباح' }, icon: Sunrise, color: 'text-orange-400', bg: 'bg-orange-50', description: { fr: 'A étudié avant 8h du matin.', en: 'Studied before 8 AM.', ar: 'درس قبل الساعة 8 صباحاً.', es: 'Estudió antes de las 8 AM.' } },
  { id: 'expert', name: { fr: 'Expert IA', en: 'AI Expert', ar: 'خبير الذكاء الاصطناعي', es: 'Experto en IA' }, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', description: { fr: 'A utilisé tous les outils IA.', en: 'Used all AI tools.', ar: 'استخدم جميع أدوات الذكاء الاصطناعي.', es: 'Usó todas las outils d\'IA.' } },
  { id: 'top_student', name: { fr: 'Major de Promo', en: 'Top Student', ar: 'الأول في الدفعة', es: 'Mejor Estudiante' }, icon: Trophy, color: 'text-primary-500', bg: 'bg-primary-50', description: { fr: 'A atteint 100% dans une matière.', en: 'Reached 100% in a subject.', ar: 'وصل إلى 100% في مادة ما.', es: 'Alcanzó el 100% en une matière.' } },
  { id: 'scholar', name: { fr: 'Chercheur', en: 'Researcher', ar: 'باحث', es: 'Investigador' }, icon: Medal, color: 'text-green-500', bg: 'bg-green-50', description: { fr: 'A consulté 5 ressources.', en: 'Consulted 5 resources.', ar: 'اطلع على 5 مصادر.', es: 'Consultó 5 ressources.' } },
];

export const Gamification: React.FC<GamificationProps> = ({ userProfile }) => {
  const lang: Language = userProfile.language || 'fr';
  const t = translations[lang];

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Bar */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
        <img 
          src={userProfile.photoURL} 
          alt={userProfile.displayName} 
          className="w-24 h-24 rounded-full border-4 border-primary-50 object-cover shadow-sm"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
            <h2 className="text-2xl font-bold text-slate-900">{userProfile.displayName}</h2>
            {userProfile.title && (
              <span className="px-3 py-1 bg-primary-600 text-white text-[10px] font-black rounded-full shadow-sm shadow-primary-100">
                {userProfile.title}
              </span>
            )}
          </div>
          <p className="text-slate-500 font-medium mb-4">{userProfile.email}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
             <div className="bg-orange-50 px-4 py-2 rounded-full border border-orange-100 flex items-center gap-2">
               <Flame className="w-4 h-4 text-orange-600 fill-current" />
               <span className="text-sm font-bold text-orange-700">{userProfile.currentStreak || 0} {t.streak_days}</span>
               {(userProfile.currentStreak || 0) >= 3 && (
                 <span className="ml-1 px-1.5 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded-lg animate-pulse">
                   {(userProfile.currentStreak || 0) >= 7 ? "1.5x BOOST" : "1.2x BOOST"}
                 </span>
               )}
             </div>
             <div className="bg-primary-50 px-4 py-2 rounded-full border border-primary-100 flex items-center gap-2">
               <Trophy className="w-4 h-4 text-primary-600" />
               <span className="text-sm font-bold text-primary-700">{userProfile.points} {t.total_xp}</span>
             </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-3xl border border-slate-100 min-w-[140px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.level}</span>
          <span className="text-4xl font-black text-slate-900">{Math.floor(userProfile.points / 100) + 1}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BADGES.map((badge, idx) => {
          const isEarned = (userProfile.badges || []).includes(badge.id);
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-3xl border transition-all ${
                isEarned 
                  ? 'bg-white border-slate-100 shadow-sm' 
                  : 'bg-slate-50 border-transparent grayscale opacity-40'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-2xl ${isEarned ? badge.bg : 'bg-slate-200'} ${badge.color}`}>
                  <badge.icon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{(badge.name as any)[lang]}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{(badge.description as any)[lang]}</p>
                </div>
              </div>
              {!isEarned && (
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Shield className="w-3 h-3" />
                  {lang === 'ar' ? "مغلق" : lang === 'en' ? "Locked" : lang === 'es' ? "Bloqueado" : "Verrouillé"}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
