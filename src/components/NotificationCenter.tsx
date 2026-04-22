import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Trash2
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { Notification, Language } from '../types';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface NotificationCenterProps {
  uid: string;
  lang: Language;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ uid, lang }) => {
  const t = translations[lang];
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = 'notifications';
    const q = query(
      collection(db, path),
      where('uid', '==', uid),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      // Sort client-side to avoid composite index requirement
      fetchedNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(fetchedNotifs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  const markAllAsRead = async () => {
    notifications.forEach(async (n) => {
      if (!n.read) await markAsRead(n.id);
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'task': return <Calendar className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-primary-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 rounded-2xl transition-all duration-300",
          isOpen 
            ? "bg-primary-600 text-white shadow-lg shadow-primary-200 scale-110" 
            : "bg-white text-slate-600 border border-slate-100 shadow-sm hover:bg-slate-50"
        )}
      >
        <Bell className={cn("w-6 h-6", isOpen ? "animate-none" : "hover:animate-bounce")} />
        {unreadCount > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1 w-5 h-5 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white transition-colors",
            isOpen ? "bg-amber-500" : "bg-red-500"
          )}>
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed md:absolute top-24 md:top-full mt-4 bg-white rounded-[32px] shadow-2xl border border-slate-100 z-50 overflow-hidden",
              "inset-x-4 md:inset-auto md:w-96 flex flex-col max-h-[70vh] md:max-h-[80vh]",
              lang === 'ar' ? "md:left-0 md:origin-top-left" : "md:right-0 md:origin-top-right"
            )}
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  {lang === 'ar' ? 'التنبيهات' : 'Notifications'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {unreadCount} {lang === 'ar' ? 'غير مقروءة' : 'non lues'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs font-bold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {lang === 'ar' ? 'قراءة الكل' : 'Tout lire'}
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {notifications.length > 0 ? (
                  <div className="space-y-1">
                    {notifications.map((n) => (
                      <motion.div 
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "p-4 rounded-2xl flex gap-4 group transition-all relative",
                          !n.read ? "bg-primary-50/40" : "hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          !n.read ? "bg-white shadow-sm" : "bg-slate-100/50"
                        )}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <p className={cn(
                              "text-sm font-bold truncate", 
                              !n.read ? "text-slate-900" : "text-slate-600"
                            )}>
                              {n.title}
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{n.message}</p>
                          {!n.read && (
                            <button 
                              onClick={() => markAsRead(n.id)}
                              className="text-[10px] font-extrabold text-primary-600 uppercase tracking-widest hover:underline"
                            >
                              {lang === 'ar' ? 'تحديد كمقروء' : 'Marquer comme lu'}
                            </button>
                          )}
                        </div>
                        {!n.read && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-600 rounded-full" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-900 font-bold">
                      {lang === 'ar' ? 'كل شيء هادئ هنا' : 'Tout est calme ici'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {lang === 'ar' ? 'ليس لديك أي تنبيهات حالياً.' : "Tu n'as aucune notification pour le moment."}
                    </p>
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    DzBac AI • Notifications intelligentes
                  </p>
                </div>
              )}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
