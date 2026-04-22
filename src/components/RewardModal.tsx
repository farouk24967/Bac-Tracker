import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Sparkles, Award } from 'lucide-react';
import { Milestone } from '../lib/xpMilestones';
import { Language } from '../types';

interface RewardModalProps {
  milestone?: Milestone;
  xpEarned?: number;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const RewardModal: React.FC<RewardModalProps> = ({ milestone, xpEarned, isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[40px] p-8 md:p-12 max-w-lg w-full shadow-2xl relative overflow-hidden text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated Decorations */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-primary-600" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ rotate: -10, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"
            >
              <Trophy className="w-12 h-12 text-orange-500 fill-current" />
            </motion.div>

            {milestone ? (
              <>
                <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">
                  {lang === 'ar' ? 'لقب جديد!' : 'Nouveau Titre Débloqué !'}
                </h2>
                <div className="bg-primary-50 py-3 px-6 rounded-2xl inline-block mb-6 border border-primary-100">
                  <span className="text-xl font-black text-primary-600 uppercase tracking-tight">
                    {milestone.title[lang]}
                  </span>
                </div>
                <p className="text-slate-600 font-medium mb-8 text-lg italic">
                  "{milestone.message[lang]}"
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">
                  {lang === 'ar' ? 'أحسنت!' : 'Félicitations !'}
                </h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                   <div className="bg-yellow-50 text-yellow-600 px-4 py-2 rounded-full font-black flex items-center gap-2 border border-yellow-100">
                     <Sparkles className="w-4 h-4" />
                     +{xpEarned} XP
                   </div>
                </div>
                <p className="text-slate-600 font-medium mb-8">
                  {lang === 'ar' ? 'لقد ربحت نقاط خبرة إضافية لجهودك!' : 'Tu as gagné des points d\'expérience pour tes efforts !'}
                </p>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                 <Star className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                 <p className="text-[10px] font-black text-slate-400 uppercase">Progression</p>
                 <p className="text-lg font-black text-slate-900">En marche</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                 <Award className="w-5 h-5 text-primary-500 mx-auto mb-2" />
                 <p className="text-[10px] font-black text-slate-400 uppercase">Objectif</p>
                 <p className="text-lg font-black text-slate-900">Réussite</p>
               </div>
            </div>

            <button
              onClick={onClose}
              className="mt-10 w-full py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-100 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-95"
            >
              {lang === 'ar' ? 'متابعة' : 'Continuer l\'aventure'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
