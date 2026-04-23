import React, { useState } from 'react';
import { signInWithGoogle } from '../firebase';
import { GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Auth: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    console.log('[Auth] Current window location:', window.location.href);
    setIsLoggingIn(true);
    setError(null);
    try {
      await signInWithGoogle();
      // onAuthStateChanged in App.tsx handles the redirect automatically
    } catch (err: any) {
      const code: string = err?.code ?? 'unknown';
      console.error('[Auth] Login failed — code:', code, '| message:', err?.message);
      setIsLoggingIn(false);

      if (code === 'auth/popup-closed-by-user') {
        setError('La fenêtre de connexion a été fermée. Réessaie.');
      } else if (code === 'auth/cancelled-popup-request') {
        setError('Une connexion est déjà en cours.');
      } else if (code === 'auth/popup-blocked') {
        setError('La fenêtre popup a été bloquée. Autorise les popups pour cette app.');
      } else if (code === 'auth/unauthorized-domain') {
        setError(`Domaine non autorisé dans Firebase Console. (${window.location.hostname})`);
      } else if (code === 'auth/network-request-failed') {
        setError('Erreur réseau. Vérifie ta connexion internet.');
      } else {
        // Show the raw code so we can diagnose quickly
        setError(`Erreur de connexion [${code}] — consulte la console pour plus de détails.`);
      }
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white relative">

      <div className="max-w-sm w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Custom Logo Image (Fallback to icon if missing) */}
          <div className="flex flex-col items-center justify-center mb-10">
            <img 
              src="/logo.png" 
              alt="Bac Tracker Logo" 
              className="w-48 md:w-64 h-auto object-contain mb-4"
              onError={(e) => {
                // Keep a fallback if the image isn't uploaded yet
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.fallback-logo')?.classList.remove('hidden');
              }}
            />
            
            <div className="fallback-logo hidden inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-4 shadow-xl shadow-blue-200">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            
            {/* The text is now part of the logo image, but we keep this as visually hidden text for screen readers, or we fall back if logo fails */}
            <h1 className="fallback-logo hidden text-4xl font-black text-slate-900 tracking-tight">
              Bac Tracker
            </h1>
          </div>

          <p className="text-slate-500 mb-12 text-lg font-medium leading-relaxed">
            L'excellence au Bac algérien commence ici. Prépare ton avenir avec l'IA.
          </p>

          <AnimatePresence mode="wait">
            {!isLoggingIn ? (
              <motion.button
                key="login-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-4 bg-slate-900 text-white font-bold py-5 px-8 rounded-[24px] hover:bg-slate-800 transition-all transform group-hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200 group"
              >
                Continuer avec Google
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
                <p className="text-slate-900 font-bold">Connexion en cours...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.p
                key="error-msg"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 text-red-500 text-sm font-semibold bg-red-50 border border-red-100 rounded-2xl px-4 py-3"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <p className="mt-8 text-slate-400 text-xs font-medium">
            En continuant, tu acceptes nos conditions d'utilisation.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

