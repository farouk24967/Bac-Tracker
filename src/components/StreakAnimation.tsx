import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Trophy, Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface StreakAnimationProps {
  streak: number;
  isVisible: boolean;
  onClose: () => void;
  lang: 'fr' | 'en' | 'ar' | 'es';
}

export const StreakAnimation: React.FC<StreakAnimationProps> = ({ streak, isVisible, onClose, lang }) => {
  const getRewardMessage = () => {
    let multiplier = "1.0x";
    if (streak >= 7) multiplier = "1.5x";
    else if (streak >= 3) multiplier = "1.2x";

    return {
      fr: `Jour ${streak} complété 🔥 Bonus ${multiplier} XP activé !`,
      en: `Day ${streak} completed 🔥 ${multiplier} XP Bonus activated!`,
      ar: `اكتمل اليوم ${streak} 🔥 تم تفعيل مكافأة XP ${multiplier}!`,
      es: `¡Día ${streak} completado 🔥 Bono de ${multiplier} XP activado!`
    };
  };

  const messages = getRewardMessage();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-white rounded-[40px] p-8 md:p-12 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
            
            {/* Animated Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 0, x: 0, opacity: 0 }}
                animate={{ 
                  y: -100 - Math.random() * 100, 
                  x: (Math.random() - 0.5) * 100,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "linear"
                }}
                className="absolute bottom-20 left-1/2 w-2 h-2 bg-orange-500 rounded-full blur-sm"
              />
            ))}

            <div className="relative z-10">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-100"
              >
                <Flame className="w-12 h-12 text-orange-600 fill-orange-600" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                  STREAK!
                </h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-orange-600">{streak} JOURS</span>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {messages[lang]}
                </p>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="mt-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Continuer
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
