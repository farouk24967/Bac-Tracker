import React, { useState, useEffect } from 'react';
import { Brain, Clock, MapPin, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Language } from '../types';

interface MemoryBadgeProps {
  lang: Language;
}

export const MemoryBadge: React.FC<MemoryBadgeProps> = ({ lang }) => {
  const [time, setTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="relative z-50">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-800 transition-all",
          isExpanded ? "rounded-b-none" : ""
        )}
      >
        <div className="relative">
          <Brain className="w-5 h-5 text-primary-400" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900"
          />
        </div>
        <div className="text-left hidden md:block">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
            {lang === 'ar' ? "الذاكرة النشطة" : "Mémoire Active"}
          </p>
          <p className="text-xs font-bold leading-none">{formatTime(time)}</p>
        </div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute top-full w-64 bg-slate-900 text-white p-5 shadow-2xl border border-slate-800 z-50 rounded-b-[24px]",
              lang === 'ar' 
                ? "right-0 rounded-tl-[24px]" 
                : "left-0 rounded-tr-[24px]"
            )}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl text-primary-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date & Heure</p>
                  <p className="text-xs font-bold">{formatDate(time)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl text-emerald-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Localisation</p>
                  <p className="text-xs font-bold">{lang === 'ar' ? "الجزائر (DzBac Cloud)" : "Algérie (DzBac Cloud)"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">État du Système</p>
                  <p className="text-xs font-bold">Connecté en temps réel</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-3 h-3 text-primary-400" />
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Flux de Mémoire</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-primary-500 to-emerald-500"
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-2 italic leading-relaxed">
                  L'intelligence DzBac analyse ton environnement et ton planning en permanence.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
