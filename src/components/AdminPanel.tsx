import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, setDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { BacSession } from '../lib/bacSessions';
import { seedBacSessionsIfEmpty, seedBacSubjectConfigs } from '../lib/bacSessions';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ShieldCheck,
  Mail,
  Calendar,
  Zap,
  Filter,
  GraduationCap,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Pencil,
  Globe,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AdminPanelProps {
  adminProfile: UserProfile;
}

interface SessionForm {
  year: string;
  examStartDate: string;
  examEndDate: string;
  resultsDate: string;
  sourceUrl: string;
  sourceVerified: boolean;
  status: BacSession['status'];
}

const EMPTY_FORM: SessionForm = {
  year: '',
  examStartDate: '',
  examEndDate: '',
  resultsDate: '',
  sourceUrl: '',
  sourceVerified: false,
  status: 'upcoming',
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ adminProfile }) => {
  const [view, setView] = useState<'users' | 'sessions'>('sessions');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');

  const [sessions, setSessions] = useState<BacSession[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SessionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'bac_sessions'), orderBy('year', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as BacSession));
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

  const toISODate = (value: string) => (value ? new Date(value).toISOString() : '');

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.year || !form.examStartDate || !form.examEndDate) {
      alert("Année, date de début et date de fin sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const year = parseInt(form.year, 10);
      const ref = doc(db, 'bac_sessions', String(year));
      await setDoc(ref, {
        year,
        examStartDate: toISODate(form.examStartDate),
        examEndDate: toISODate(form.examEndDate),
        resultsDate: form.resultsDate ? toISODate(form.resultsDate) : null,
        status: form.status,
        sourceUrl: form.sourceUrl || null,
        sourceVerified: form.sourceVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving session:", error);
      alert("Erreur lors de l'enregistrement de la session.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSession = (s: BacSession) => {
    setEditingId(s.id);
    setForm({
      year: String(s.year),
      examStartDate: s.examStartDate ? s.examStartDate.slice(0, 16) : '',
      examEndDate: s.examEndDate ? s.examEndDate.slice(0, 16) : '',
      resultsDate: s.resultsDate ? s.resultsDate.slice(0, 16) : '',
      sourceUrl: s.sourceUrl || '',
      sourceVerified: !!s.sourceVerified,
      status: s.status || 'upcoming',
    });
  };

  const handleDeleteSession = async (s: BacSession) => {
    if (!confirm(`Supprimer la session BAC ${s.year} ?`)) return;
    try {
      await deleteDoc(doc(db, 'bac_sessions', s.id));
      if (editingId === s.id) {
        setEditingId(null);
        setForm(EMPTY_FORM);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Erreur lors de la suppression.");
    }
  };

  const handleSeed = async () => {
    await seedBacSessionsIfEmpty(true);
    await seedBacSubjectConfigs();
    alert("Sessions et configurations de référence restaurées (matières + coefficients).");
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary-600" />
            Administration
          </h2>
          <p className="text-slate-500 mt-1">Gère les accès, les paiements et les sessions BAC.</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {([
            { id: 'sessions', label: 'Sessions BAC', icon: GraduationCap },
            { id: 'users', label: 'Utilisateurs', icon: Users },
          ] as const).map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2",
                view === v.id ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <v.icon className="w-4 h-4" />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'sessions' ? (
        <div className="space-y-8">
          {/* Formulaire ajout / édition */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-3">
                <Plus className="w-5 h-5 text-primary-600" />
                {editingId ? `Modifier la session ${editingId}` : 'Ajouter une session'}
              </h3>
              {editingId && (
                <button
                  onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Annuler
                </button>
              )}
            </div>

            <form onSubmit={handleSaveSession} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Année</span>
                <input
                  type="number"
                  min="2025"
                  max="2099"
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="2028"
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Date début des examens</span>
                <input
                  type="datetime-local"
                  required
                  value={form.examStartDate}
                  onChange={(e) => setForm({ ...form, examStartDate: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Date fin des examens</span>
                <input
                  type="datetime-local"
                  required
                  value={form.examEndDate}
                  onChange={(e) => setForm({ ...form, examEndDate: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Date des résultats (optionnel)</span>
                <input
                  type="datetime-local"
                  value={form.resultsDate}
                  onChange={(e) => setForm({ ...form, resultsDate: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Source officielle</span>
                <input
                  type="url"
                  value={form.sourceUrl}
                  onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                  placeholder="https://www.onec.dz"
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Statut</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as BacSession['status'] })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminée</option>
                </select>
              </label>

              <div className="lg:col-span-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.sourceVerified}
                    onChange={(e) => setForm({ ...form, sourceVerified: e.target.checked })}
                    className="w-5 h-5 rounded-lg accent-emerald-500"
                  />
                  <span className="text-sm font-bold text-slate-600">Information vérifiée</span>
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Enregistrement...' : (editingId ? 'Enregistrer' : 'Ajouter la session')}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Liste des sessions */}
          <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary-600" />
                Sessions BAC
              </h3>
              <button
                onClick={handleSeed}
                className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-primary-600 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Réinitialiser depuis la référence
              </button>
            </div>

            <div className="space-y-4">
              {sessions.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <GraduationCap className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">Aucune session. Ajoute la première session.</p>
                </div>
              )}

              {sessions.map((s) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary-600">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">BAC {s.year}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400 mt-0.5">
                        <span>Début : {new Date(s.examStartDate).toLocaleDateString('fr-FR')}</span>
                        <span>Fin : {new Date(s.examEndDate).toLocaleDateString('fr-FR')}</span>
                        {s.sourceVerified && (
                          <span className="text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Vérifiée
                          </span>
                        )}
                      </div>
                      {s.sourceUrl && (
                        <a
                          href={s.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-600 mt-1 hover:underline"
                        >
                          <Globe className="w-3 h-3" />
                          Source officielle
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      s.status === 'completed'
                        ? "bg-slate-200 text-slate-500"
                        : s.status === 'in_progress'
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-amber-100 text-amber-600"
                    )}>
                      {s.status === 'completed' ? 'Terminée' : s.status === 'in_progress' ? 'En cours' : 'Upcoming'}
                    </span>
                    <button
                      onClick={() => handleEditSession(s)}
                      className="p-2.5 rounded-xl bg-white text-slate-500 hover:text-primary-600 shadow-sm transition-all"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(s)}
                      className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-red-500 shadow-sm transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
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
      )}
    </div>
  );
};
