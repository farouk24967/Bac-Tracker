import React, { useRef, useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Wrench, 
  Library, 
  LogOut, 
  GraduationCap,
  Trophy,
  Camera,
  Loader2,
  Globe,
  X,
  Menu,
  Calendar,
  Calculator,
  Settings as SettingsIcon,
  BarChart3
} from 'lucide-react';
import { logout, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { Language } from '../types';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: any;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userProfile, isOpen, onClose, onOpen }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const lang: Language = userProfile.language || 'fr';
  const t = translations[lang];

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'calendar', label: lang === 'ar' ? 'التقويم' : 'Calendrier', icon: Calendar },
    { id: 'chatbot', label: t.chatbot, icon: MessageSquare },
    { id: 'resources', label: t.resources, icon: Library },
    { id: 'average', label: lang === 'ar' ? 'حساب المعدل' : 'Moyenne', icon: Calculator },
    { id: 'gamification', label: t.gamification, icon: Trophy },
    { id: 'analytics', label: lang === 'ar' ? 'التحليلات' : 'Analytics', icon: BarChart3 },
    { id: 'settings', label: lang === 'ar' ? 'الإعدادات' : 'Paramètres', icon: SettingsIcon },
  ];

  const mobileBottomItems = [
    { id: 'dashboard', label: lang === 'ar' ? 'البداية' : 'Home', icon: LayoutDashboard },
    { id: 'calendar', label: lang === 'ar' ? 'التقويم' : 'Planning', icon: Calendar },
    { id: 'chatbot', label: 'IA', icon: MessageSquare },
    { id: 'resources', label: 'Docs', icon: Library },
  ];

  const changeLanguage = async (newLang: Language) => {
    await updateDoc(doc(db, 'users', userProfile.uid), {
      language: newLang
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64Image = canvas.toDataURL('image/jpeg', 0.8);

          await updateDoc(doc(db, 'users', userProfile.uid), {
            photoURL: base64Image
          });
          setIsUploading(false);
        };
      };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            
            {/* Drawer Content */}
            <motion.div
              initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "fixed top-0 bottom-0 w-[280px] bg-white z-[70] lg:hidden flex flex-col shadow-2xl",
                lang === 'ar' ? "right-0" : "left-0"
              )}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-50 p-2 rounded-xl flex items-center justify-center overflow-hidden w-10 h-10">
                    <img 
                      src="/logo.png" 
                      alt="Bac Tracker Logo" 
                      className="w-full h-full object-contain scale-150"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                        e.currentTarget.parentElement?.classList.replace('bg-primary-50', 'bg-primary-600');
                      }}
                    />
                    <GraduationCap className="fallback-icon hidden w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-xl text-slate-900 tracking-tight">Bac Tracker</span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-1 mt-6">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      onClose?.();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all",
                      activeTab === item.id 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="p-6 border-t border-slate-100 space-y-6">
                {/* Language Switcher */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 px-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Langue</span>
                  </div>
                  <div className="flex gap-2">
                    {(['fr', 'en', 'ar', 'es'] as Language[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => changeLanguage(l)}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                          lang === l ? "bg-primary-600 text-white shadow-lg shadow-primary-100" : "bg-slate-50 text-slate-400"
                        )}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <img 
                    src={userProfile.photoURL} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 truncate">{userProfile.displayName}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                        {userProfile.currentStreak || 0} 🔥
                      </span>
                      <p className="text-[10px] text-slate-500 truncate">{userProfile.stream}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  {t.logout}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex w-64 h-screen bg-white border-r border-slate-100 flex-col fixed left-0 top-0 z-20",
        lang === 'ar' && "right-0 left-auto border-l border-r-0"
      )} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary-50 p-2 rounded-xl flex items-center justify-center overflow-hidden w-10 h-10">
                    <img 
                      src="/logo.png" 
                      alt="Bac Tracker Logo" 
                      className="w-full h-full object-contain scale-150"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                        e.currentTarget.parentElement?.classList.replace('bg-primary-50', 'bg-primary-600');
                      }}
                    />
                    <GraduationCap className="fallback-icon hidden w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">Bac Tracker</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all relative group",
                activeTab === item.id 
                  ? "bg-primary-50 text-primary-700 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="sidebar-active"
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-600 rounded-full",
                    lang === 'ar' ? "-right-1" : "-left-1"
                  )}
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-transform",
                activeTab === item.id ? "scale-110" : "group-hover:scale-110"
              )} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-4">
          {/* Language Switcher */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Globe className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Langue</span>
            </div>
            <div className="flex gap-1">
              {(['fr', 'en', 'ar', 'es'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => changeLanguage(l)}
                  className={cn(
                    "w-6 h-6 rounded-lg text-[10px] font-bold transition-all",
                    lang === l ? "bg-primary-600 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  )}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
            <div className="relative group cursor-pointer flex-shrink-0" onClick={handleImageClick}>
              <img 
                src={userProfile.photoURL} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-slate-900 truncate">{userProfile.displayName}</p>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  {userProfile.currentStreak || 0} 🔥
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate" dir="rtl">{userProfile.stream}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {t.logout}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className={cn(
        "lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md bg-white/80 backdrop-blur-xl border border-white/20 z-50 p-2 flex justify-around items-center rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]",
        lang === 'ar' && "flex-row-reverse"
      )}>
        {mobileBottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all min-w-[56px]",
              activeTab === item.id 
                ? "bg-primary-600/10 text-primary-600" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "scale-110" : "scale-100")} />
            <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[50px]">{item.label}</span>
          </button>
        ))}
        <button
          onClick={isOpen ? onClose : onOpen}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all min-w-[56px]",
            isOpen ? "bg-primary-600/10 text-primary-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <div className="relative">
            <img 
              src={userProfile.photoURL} 
              alt="Profile" 
              className={cn(
                "w-5 h-5 rounded-full object-cover border-2 shadow-sm transition-all",
                isOpen ? "border-primary-600 scale-110" : "border-white scale-100"
              )}
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
              <Menu className="w-2 h-2 text-slate-600" />
            </div>
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[50px]">Menu</span>
        </button>
      </div>
    </>
  );
};
