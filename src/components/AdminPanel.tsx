import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ShieldCheck,
  Mail,
  Calendar,
  Zap,
  MoreVertical,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AdminPanelProps {
  adminProfile: UserProfile;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ adminProfile }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleUserStatus = async (user: UserProfile) => {
    const userRef = doc(db, 'users', user.uid);
    const newStatus = user.status === 'active' ? 'pending' : 'active';
    const newPaid = newStatus === 'active';

    try {
      await updateDoc(userRef, {
        status: newStatus,
        paid: newPaid
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Erreur lors de la mise à jour de l'utilisateur.");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || u.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary-600" />
            Gestion des Utilisateurs
          </h2>
          <p className="text-slate-500 mt-1">Gère les accès et les paiements WhatsApp.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-64 font-bold"
            />
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            {(['all', 'active', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize",
                  filter === f ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'En attente'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map((u) => (
            <motion.div
              key={u.uid}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100">
                    <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 truncate max-w-[150px]">{u.displayName}</h4>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <Mail className="w-3 h-3" />
                      {u.email}
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                  u.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  {u.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {u.status === 'active' ? 'Actif' : 'En attente'}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Créé le
                  </div>
                  <span className="text-slate-900">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : 'Inconnu'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Points
                  </div>
                  <span className="text-slate-900">{u.points || 0} XP</span>
                </div>
              </div>

              <button
                onClick={() => toggleUserStatus(u)}
                disabled={u.email === 'bouayedfarouk63@gmail.com'}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2",
                  u.status === 'active' 
                    ? "bg-red-50 text-red-600 hover:bg-red-100" 
                    : "bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700"
                )}
              >
                {u.status === 'active' ? 'Bloquer l\'accès' : 'Activer l\'accès'}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredUsers.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Aucun utilisateur trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
};
