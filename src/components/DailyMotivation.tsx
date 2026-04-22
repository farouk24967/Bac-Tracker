import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Book, Moon, Quote, X, ChevronRight } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { MOTIVATION_DATA, MotivationItem } from '../data/motivationData';
import { cn } from '../lib/utils';

interface DailyMotivationProps {
  userProfile: UserProfile;
  inline?: boolean;
}

export const DailyMotivation: React.FC<DailyMotivationProps> = ({ userProfile, inline = false }) => {
  const [isOpen, setIsOpen] = useState(!inline);
  const [dayItem, setDayItem] = useState<MotivationItem | null>(null);
  const lang: Language = userProfile.language || 'fr';
  const settings = userProfile.motivationSettings || { enabled: true, type: 'both' };

  useEffect(() => {
    // Select item based on current date to ensure it changes daily but is consistent for all users on the same day
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const index = dayOfYear % MOTIVATION_DATA.length;
    setDayItem(MOTIVATION_DATA[index]);

    // If it's the first time today, show the modal (if not inline)
    const lastShown = localStorage.getItem('lastMotivationShown');
    const todayStr = today.toISOString().split('T')[0];
    if (lastShown === todayStr && !inline) {
      setIsOpen(false);
    }
  }, [inline]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('lastMotivationShown', new Date().toISOString().split('T')[0]);
  };

  if (!settings.enabled || !dayItem) return null;

  const showSpiritual = settings.type === 'spiritual' || settings.type === 'both';
  const showMotivation = settings.type === 'motivation' || settings.type === 'both';

  const CardContent = () => (
    <div className="space-y-6">
      {showMotivation && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-2 rounded-[40px] border border-slate-100/50 shadow-sm relative overflow-hidden group"
        >
          {dayItem.youtubeId && (
            <div className="relative aspect-video rounded-[32px] overflow-hidden mb-4 bg-slate-900 shadow-inner group-hover:shadow-primary-100/20 transition-all">
              <iframe
                src={`https://www.youtube.com/embed/${dayItem.youtubeId}?autoplay=0&controls=1&rel=0`}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Motivation de jour"
              />
            </div>
          )}
          
          <div className="p-4 px-6">
            <p className="text-xl font-black text-slate-900 leading-tight mb-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {dayItem.message[lang] || dayItem.message.fr}
            </p>
            {lang !== 'ar' && (
              <p className="text-sm font-bold text-slate-500" dir="rtl">
                {dayItem.message.ar}
              </p>
            )}

            <div className="flex items-center gap-3 mt-6 border-t border-slate-50 pt-4">
              <div className="bg-primary-600 p-2 rounded-xl text-white">
                <Star className="w-4 h-4 shadow-sm" />
              </div>
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50/50 px-3 py-1 rounded-full">Motivation</span>
            </div>
          </div>
        </motion.div>
      )}

      {showSpiritual && dayItem.quran && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100/50 relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <Book className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-600 p-2 rounded-xl text-white">
              <Book className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Coran</span>
          </div>
          <p className="text-lg font-bold text-slate-900 leading-relaxed mb-3 text-right" dir="rtl">
            {dayItem.quran.ar}
          </p>
          <p className="text-sm font-medium text-slate-600 italic">
            "{dayItem.quran[lang] || dayItem.quran.fr}"
          </p>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2">
            {dayItem.quran.source}
          </p>
        </motion.div>
      )}

      {showSpiritual && dayItem.hadith && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-50/50 p-6 rounded-[32px] border border-amber-100/50 relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <Moon className="w-24 h-24 text-amber-600" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-600 p-2 rounded-xl text-white">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Hadith</span>
          </div>
          <p className="text-lg font-bold text-slate-900 leading-relaxed mb-3 text-right" dir="rtl">
            {dayItem.hadith.ar}
          </p>
          <p className="text-sm font-medium text-slate-600 italic">
            "{dayItem.hadith[lang] || dayItem.hadith.fr}"
          </p>
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-2">
            {dayItem.hadith.source}
          </p>
        </motion.div>
      )}

      {showMotivation && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <Quote className="w-24 h-24 text-slate-400" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white">
              <Quote className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Citation</span>
          </div>
          <p className="text-lg font-bold text-slate-800 leading-tight mb-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {dayItem.citation[lang] || dayItem.citation.fr}
          </p>
          {lang !== 'ar' && (
            <p className="text-sm font-bold text-slate-400" dir="rtl">
              {dayItem.citation.ar}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary-600 p-3 rounded-2xl text-white shadow-lg shadow-primary-100">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {lang === 'ar' ? "إلهام اليوم" : "Inspiration du jour"}
              </h3>
              <p className="text-slate-500 text-sm">
                {lang === 'ar' ? "كلمات لتعزيز عزيمتك" : "Des mots pour booster ta détermination"}
              </p>
            </div>
          </div>
        </div>
        <CardContent />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[48px] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 via-emerald-500 to-amber-500" />
            
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-10">
              <div className="inline-flex bg-primary-50 p-4 rounded-3xl text-primary-600 mb-6">
                <Star className="w-10 h-10 animate-pulse" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">
                {lang === 'ar' ? "صباح الخير!" : "Bonjour !"}
              </h2>
              <p className="text-slate-500 font-bold">
                {lang === 'ar' ? "إليك جرعتك اليومية من التحفيز" : "Voici ta dose quotidienne de motivation"}
              </p>
            </div>

            <CardContent />

            <div className="mt-10">
              <button
                onClick={handleClose}
                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
              >
                {lang === 'ar' ? "ابدأ الدراسة" : "Commencer à étudier"}
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
