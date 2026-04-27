import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';
import { updateStreak, checkXPProgression } from './lib/gamificationUtils';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { StudyCalendar } from './components/StudyCalendar';
import { Sidebar } from './components/Sidebar';
import { Chatbot } from './components/Chatbot';
import { Resources } from './components/Resources';
import { AverageCalculator } from './components/AverageCalculator';
import { Gamification } from './components/Gamification';
import { Settings } from './components/Settings';
import { Analytics } from './components/Analytics';
import { MemoryBadge } from './components/MemoryBadge';
import { useAutoStudyTime } from './hooks/useAutoStudyTime';
import { DailyMotivation } from './components/DailyMotivation';
import { FOOTER_QUOTES } from './data/motivationData';
import { NotificationCenter } from './components/NotificationCenter';
import { useNotifications } from './hooks/useNotifications';
import { useReminders } from './hooks/useReminders';
import { UserProfile, Language } from './types';
import { translations } from './translations';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Loader2, 
  Menu, 
  ChevronRight,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Library,
  Calculator,
  Trophy,
  Settings as SettingsIcon,
  BarChart3,
  Home
} from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isManualSessionActive, setIsManualSessionActive] = useState(false);

  const lang: Language = profile?.language || 'fr';
  const t = translations[lang];

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const footerQuote = FOOTER_QUOTES[dayOfYear % FOOTER_QUOTES.length];

  const getActiveTabInfo = () => {
    switch (activeTab) {
      case 'dashboard': return { label: t.dashboard, icon: LayoutDashboard };
      case 'calendar': return { label: lang === 'ar' ? 'التقويم' : 'Calendrier', icon: Calendar };
      case 'chatbot': return { label: t.chatbot, icon: MessageSquare };
      case 'resources': return { label: t.resources, icon: Library };
      case 'average': return { label: lang === 'ar' ? 'حساب المعدل' : 'Moyenne', icon: Calculator };
      case 'gamification': return { label: t.gamification, icon: Trophy };
      case 'analytics': return { label: lang === 'ar' ? 'التحليلات' : 'Analytics', icon: BarChart3 };
      case 'settings': return { label: lang === 'ar' ? 'الإعدادات' : 'Paramètres', icon: SettingsIcon };
      default: return { label: t.dashboard, icon: LayoutDashboard };
    }
  };

  const activeTabInfo = getActiveTabInfo();

  useNotifications(user?.uid);
  useReminders(user?.uid, lang);
  useAutoStudyTime(user?.uid, isManualSessionActive);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
        if (!u.email) {
          console.error("User has no email, cannot verify payment status");
          setProfile(null);
          setLoading(false);
          return;
        }

        const docRef = doc(db, 'users', u.email);
        
        // Listen for profile changes
        unsubscribeProfile = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            const profileData = snap.data() as UserProfile;
            
            // PAYMENT CONTROL
            if (!profileData.paid || profileData.status !== 'active') {
              console.log("Payment required or account inactive");
              window.open("https://wa.me/213663507795?text=Bonjour%20je%20veux%20acheter%20l'accès%20à%20Bac%20Tracker", '_blank');
              auth.signOut();
              setProfile(null);
              setLoading(false);
              return;
            }

            setProfile(profileData);

            // Ensure user has a title based on XP
            if (!profileData.title) {
              checkXPProgression(profileData, profileData.points || 0);
            }
          } else {
            // CAS 1 : Document n’existe pas
            console.log("No user document found, redirecting to payment");
            window.open("https://wa.me/213663507795?text=Bonjour%20je%20veux%20acheter%20l'accès%20à%20Bac%20Tracker", '_blank');
            auth.signOut();
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error with profile snapshot:", error);
          setProfile(null);
          setLoading(false);
        });
      } else {
        setProfile(null);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  useEffect(() => {
    if (profile?.theme) {
      document.documentElement.setAttribute('data-theme', profile.theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [profile?.theme]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
           className="mb-8"
        >
           <img 
              src="/logo.png" 
              alt="Bac Tracker Logo" 
              className="w-32 h-32 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
              }}
            />
            <div className="fallback-icon hidden bg-primary-600 p-6 rounded-3xl shadow-xl">
              <GraduationCap className="w-16 h-16 text-white" />
            </div>
        </motion.div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="mb-4"
        >
          <Loader2 className="w-8 h-8 text-primary-600" />
        </motion.div>
        <p className="text-slate-500 font-medium animate-pulse">Chargement de ton univers Bac Tracker...</p>
      </div>
    );
  }

  if (!user || (user && !profile && !loading)) return <Auth />;

  if (user && profile && !profile.onboardingCompleted) {
    return (
      <ErrorBoundary>
        <Onboarding user={user} onComplete={setProfile} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <DailyMotivation userProfile={profile!} />
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userProfile={profile!} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpen={() => setIsMobileMenuOpen(true)}
      />
      
      <main className={cn(
        "flex-1 p-3 md:p-10 min-h-screen overflow-y-auto pb-32 md:pb-10",
        lang === 'ar' ? "lg:mr-64 lg:ml-0" : "lg:ml-64 lg:mr-0"
      )}>
        <ErrorBoundary>
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4 md:gap-6 relative z-30">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="space-y-1 md:space-y-4">
              {/* Modern Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 mb-2">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-primary-600 transition-colors group"
                >
                  <div className="p-1 rounded-md group-hover:bg-primary-50 transition-colors">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Bac Tracker</span>
                </button>
                <ChevronRight className={cn(
                  "w-3 h-3 text-slate-300",
                  lang === 'ar' && "rotate-180"
                )} />
                <div className="flex items-center gap-1.5 text-primary-600 bg-primary-50/50 px-2 py-1 rounded-lg">
                  <activeTabInfo.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{activeTabInfo.label}</span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {activeTab === 'dashboard' && `${t.hello}, ${profile?.displayName} 👋`}
                {activeTab === 'chatbot' && t.chatbot}
                {activeTab === 'resources' && t.resources}
                {activeTab === 'gamification' && t.gamification}
              </h1>
              <p className="text-slate-500 mt-1 text-sm md:text-base">
                {activeTab === 'dashboard' && t.study_day}
                {activeTab === 'calendar' && (lang === 'ar' ? "نظم مراجعاتك بذكاء." : "Organise tes révisions intelligemment.")}
                {activeTab === 'chatbot' && (lang === 'ar' ? "اطرح أسئلتك حول أي مادة." : "Pose tes questions sur n'importe quelle matière.")}
                {activeTab === 'resources' && (lang === 'ar' ? "الوصول إلى المصادر التعليمية وأدوات الذكاء الاصطناعي." : "Accède aux ressources pédagogiques et outils d'IA.")}
                {activeTab === 'average' && (lang === 'ar' ? "احسب معدلك بسهولة." : "Calcule ta moyenne facilement.")}
                {activeTab === 'gamification' && (lang === 'ar' ? "اكتشف أوسمتك ومستواك الحالي." : "Découvre tes badges et ton niveau actuel.")}
                {activeTab === 'analytics' && (lang === 'ar' ? "حلل أداءك وتقدمك." : "Analyse tes performances et tes progrès.")}
                {activeTab === 'settings' && (lang === 'ar' ? "تخصيص تجربتك." : "Personnalise ton expérience.")}
              </p>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-600 hover:text-primary-600 transition-all"
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <Menu className="w-6 h-6" />
              </motion.div>
            </button>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4">
            <MemoryBadge lang={lang} />
            <NotificationCenter uid={profile!.uid} lang={lang} />
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
              <div className="bg-primary-50 w-7 h-7 overflow-hidden rounded-lg flex items-center justify-center">
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
                  <GraduationCap className="w-4 h-4 text-white hidden fallback-icon" />
              </div>
              <span className="text-xs md:text-sm font-bold text-slate-700" dir="rtl">{profile?.stream}</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                userProfile={profile!} 
                onTabChange={setActiveTab} 
                onManualSessionChange={setIsManualSessionActive}
              />
            )}
            {activeTab === 'calendar' && <StudyCalendar userProfile={profile!} />}
            {activeTab === 'chatbot' && <Chatbot userProfile={profile!} />}
            {activeTab === 'resources' && <Resources userProfile={profile!} />}
            {activeTab === 'average' && <AverageCalculator userProfile={profile!} />}
            {activeTab === 'gamification' && <Gamification userProfile={profile!} />}
            {activeTab === 'analytics' && <Analytics userProfile={profile!} />}
            {activeTab === 'settings' && <Settings userProfile={profile!} />}
          </motion.div>
        </AnimatePresence>
        </ErrorBoundary>

        <footer className="mt-12 py-8 border-t border-slate-100 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-50">
            <span className="text-primary-600">✨</span>
            <p className="text-sm font-bold text-slate-500 italic">
              {footerQuote[lang] || footerQuote.fr}
            </p>
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-4">
            Bac Tracker © 2026 • Made with ❤️ for Algerian Students
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
