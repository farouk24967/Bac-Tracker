import React from 'react';
import { motion } from 'motion/react';
import { Star, Book, Moon, Bell, Shield, Globe, Sun, LogOut } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db, logout } from '../firebase';
import { cn } from '../lib/utils';

interface SettingsProps {
  userProfile: UserProfile;
}

export const Settings: React.FC<SettingsProps> = ({ userProfile }) => {
  const lang: Language = userProfile.language || 'fr';
  const settings = userProfile.motivationSettings || { enabled: true, type: 'both' };

  const updateMotivation = async (updates: any) => {
    await updateDoc(doc(db, 'users', userProfile.email), {
      motivationSettings: { ...settings, ...updates }
    });
  };

  const t = {
    fr: {
      title: "Paramètres",
      motivation: "Motivation Quotidienne",
      motivation_desc: "Affiche une carte inspirante chaque jour à l'ouverture.",
      type: "Type de contenu",
      type_motivation: "Motivation seulement",
      type_spiritual: "Spirituel seulement",
      type_both: "Les deux",
      enabled: "Activé",
      disabled: "Désactivé"
    },
    ar: {
      title: "الإعدادات",
      motivation: "التحفيز اليومي",
      motivation_desc: "عرض بطاقة ملهمة كل يوم عند الافتتاح.",
      type: "نوع المحتوى",
      type_motivation: "تحفيز فقط",
      type_spiritual: "روحاني فقط",
      type_both: "كلاهما",
      enabled: "مفعل",
      disabled: "معطل"
    }
  }[lang === 'ar' ? 'ar' : 'fr'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-black text-slate-900">{t.title}</h2>
        <p className="text-slate-500 mt-1">Personnalise ton expérience Bac Tracker.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Motivation Settings */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{t.motivation}</h3>
              <p className="text-slate-500 text-sm">{t.motivation_desc}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="font-bold text-slate-700">{t.enabled}</span>
              <button
                onClick={() => updateMotivation({ enabled: !settings.enabled })}
                className={cn(
                  "w-14 h-8 rounded-full transition-all relative",
                  settings.enabled ? "bg-primary-600" : "bg-slate-200"
                )}
              >
                <motion.div
                  animate={{ x: settings.enabled ? 24 : 4 }}
                  className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                {t.type}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'motivation', label: t.type_motivation, icon: Star, color: 'text-primary-600', bg: 'bg-primary-50' },
                  { id: 'spiritual', label: t.type_spiritual, icon: Moon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { id: 'both', label: t.type_both, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateMotivation({ type: item.id })}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                      settings.type === item.id 
                        ? "border-primary-600 bg-primary-50/50" 
                        : "border-slate-50 bg-white hover:border-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl", item.bg, item.color)}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-700">{item.label}</span>
                    </div>
                    {settings.type === item.id && (
                      <div className="w-2 h-2 rounded-full bg-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Other Settings Placeholder */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {lang === 'ar' ? 'المظهر والألوان' : 'Thème & Couleurs'}
              </h3>
              <p className="text-slate-500 text-sm">
                 {lang === 'ar' ? 'اختر اللون الرئيسي للتطبيق' : 'Personnalise les couleurs de ton espace.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {['indigo', 'emerald', 'rose'].map((colorTheme) => {
                const colorConfig = {
                  indigo: { label: 'Indigo', bg: 'bg-[#4f46e5]' },
                  emerald: { label: 'Émeraude', bg: 'bg-[#059669]' },
                  rose: { label: 'Rose', bg: 'bg-[#e11d48]' }
                }[colorTheme as 'indigo' | 'emerald' | 'rose'];

                const isSelected = (userProfile.theme || 'indigo') === colorTheme;

                const updateTheme = async (theme: 'indigo' | 'emerald' | 'rose') => {
                  try {
                    await updateDoc(doc(db, 'users', userProfile.email), { theme });
                  } catch (error) {
                    console.error("Error updating theme:", error);
                  }
                };

                return (
                  <button
                    key={colorTheme}
                    onClick={() => updateTheme(colorTheme as 'indigo' | 'emerald' | 'rose')}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                      isSelected 
                        ? "border-primary-500 bg-primary-50/50 shadow-md" 
                        : "border-slate-100 bg-white hover:border-slate-200"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl shadow-sm", colorConfig.bg, isSelected && "ring-4 ring-primary-100")} />
                    <span className={cn(
                      "font-bold text-sm",
                      isSelected ? "text-primary-700" : "text-slate-600"
                    )}>{colorConfig.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 opacity-50 pointer-events-none pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="font-bold text-slate-700">Notifications Push</span>
              </div>
              <div className="w-14 h-8 rounded-full bg-slate-200" />
            </div>
          </div>
          
          <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              D'autres options de personnalisation arrivent bientôt pour t'aider à mieux t'organiser !
            </p>
          </div>
        </div>

        {/* Account Settings / Danger Zone */}
        <div className="md:col-span-2 bg-red-50 p-8 rounded-[40px] shadow-sm border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-2xl text-red-600">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {lang === 'ar' ? 'الحساب' : 'Compte'}
              </h3>
              <p className="text-slate-600 text-sm">
                {lang === 'ar' ? 'تسجيل الخروج من حسابك للتبديل بين الحسابات' : 'Déconnecte-toi de ton compte en toute sécurité.'}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
          </button>
        </div>
      </div>
    </div>
  );
};
