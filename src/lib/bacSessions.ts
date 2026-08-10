import {
  collection,
  getDocs,
  setDoc,
  getDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getSessionConfig, SESSION_CONFIGS } from './bacConfig';

// =============================================================
// SYSTÈME DE SESSIONS BAC
// La session active est TOUJOURS déterminée par les dates
// officielles (examen) stockées dans `bac_sessions`.
// Aucune année n'est codée en dur dans la logique : le moteur
// fonctionne pour 2027, 2028, 2029, ... sans modification.
// =============================================================

export type BacSessionStatus = 'upcoming' | 'in_progress' | 'completed';

export interface BacSession {
  id: string;
  year: number;
  examStartDate: string; // ISO
  examEndDate: string; // ISO
  resultsDate?: string; // ISO
  status: BacSessionStatus;
  sourceUrl?: string;
  sourceVerified: boolean;
  createdAt?: any;
  updatedAt?: any;
}

// Données de référence vérifiées (fallback hors-ligne).
// En ligne, `bac_sessions` dans Firestore fait foi (source officielle).
export const DEFAULT_SESSIONS: BacSession[] = [
  {
    id: '2026',
    year: 2026,
    examStartDate: '2026-06-07T08:00:00',
    examEndDate: '2026-06-11T18:00:00',
    resultsDate: '2026-07-25T09:00:00',
    status: 'completed',
    sourceUrl: 'https://www.onec.dz',
    sourceVerified: true,
  },
  {
    id: '2027',
    year: 2027,
    examStartDate: '2027-06-06T08:00:00',
    examEndDate: '2027-06-10T18:00:00',
    resultsDate: '2027-07-25T09:00:00',
    status: 'upcoming',
    sourceUrl: 'https://www.onec.dz',
    sourceVerified: true,
  },
  {
    id: '2028',
    year: 2028,
    examStartDate: '2028-06-04T08:00:00',
    examEndDate: '2028-06-08T18:00:00',
    resultsDate: '2028-07-23T09:00:00',
    status: 'upcoming',
    sourceUrl: 'https://www.onec.dz',
    sourceVerified: true,
  },
];

export function parseDate(dateStr?: string): number | null {
  if (!dateStr) return null;
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? null : t;
}

export function sessionStatusFor(session: BacSession, now: number): BacSessionStatus {
  const start = parseDate(session.examStartDate);
  const end = parseDate(session.examEndDate);
  if (end !== null && now > end) return 'completed';
  if (start !== null && now >= start && (end === null || now <= end)) return 'in_progress';
  return 'upcoming';
}

export interface ActiveSessionInfo {
  active: BacSession | null;
  previous: BacSession | null;
  next: BacSession | null;
  all: BacSession[];
}

/**
 * Détermine la session active :
 *   active = première session dont exam_end_date >= currentDate
 * Si aucune (toutes terminées) → active = null, previous = dernière session.
 * La prochaine session (exam_end >= now) devient automatiquement active.
 */
export function determineActiveSession(sessions: BacSession[], now: number): ActiveSessionInfo {
  const sorted = [...sessions].sort((a, b) => a.year - b.year);
  const active = sorted.find(s => {
    const end = parseDate(s.examEndDate);
    return end !== null && end >= now;
  }) || null;

  let previous: BacSession | null = null;
  if (active) {
    const idx = sorted.findIndex(s => s.id === active.id);
    previous = idx > 0 ? sorted[idx - 1] : null;
  } else if (sorted.length > 0) {
    previous = sorted[sorted.length - 1];
  }

  const next = active
    ? (sorted.find(s => s.year > active.year) || null)
    : null;

  return { active, previous, next, all: sorted };
}

export async function fetchBacSessions(): Promise<BacSession[]> {
  const q = query(collection(db, 'bac_sessions'), orderBy('year', 'asc'));
  const snap = await getDocs(q);
  if (snap.empty) return [];
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as BacSession);
}

/**
 * Seed best-effort : écrit les sessions de référence si la collection
 * est vide (ou force l'écriture si `force` est vrai).
 * Seul l'administrateur a le droit d'écrire (voir règles).
 */
export async function seedBacSessionsIfEmpty(force = false): Promise<void> {
  try {
    const q = query(collection(db, 'bac_sessions'), orderBy('year', 'asc'));
    const snap = await getDocs(q);
    if (!force && !snap.empty) return;
    const now = serverTimestamp();
    for (const s of DEFAULT_SESSIONS) {
      await setDoc(doc(db, 'bac_sessions', String(s.year)), {
        year: s.year,
        examStartDate: s.examStartDate,
        examEndDate: s.examEndDate,
        resultsDate: s.resultsDate || null,
        status: s.status,
        sourceUrl: s.sourceUrl || null,
        sourceVerified: s.sourceVerified,
        createdAt: now,
        updatedAt: now,
      }, { merge: true });
    }
  } catch (e) {
    // Permission refusée (non-admin) → le fallback local est utilisé.
  }
}

/**
 * Seed best-effort : écrit la configuration officielle des matières et
 * coefficients (session + filière + matière) dans `bac_subject_configs`.
 * Une seule source de vérité pour les coefficients de chaque session.
 */
export async function seedBacSubjectConfigs(): Promise<void> {
  try {
    for (const yearStr of Object.keys(SESSION_CONFIGS)) {
      const year = Number(yearStr);
      const cfg = getSessionConfig(year);
      await setDoc(doc(db, 'bac_subject_configs', yearStr), {
        year,
        sourceVerified: true,
        sourceUrl: 'https://www.onec.dz',
        streams: Object.fromEntries(
          Object.entries(cfg).map(([stream, subjects]) => [
            stream,
            subjects.map(s => ({ name: s.name, coef: s.coef, optional: !!s.optional })),
          ])
        ),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  } catch (e) {
    // Permission refusée (non-admin) → le fallback local est utilisé.
  }
}

/**
 * Heure serveur : on écrit un timestamp serveur dans un document sonde,
 * puis on le relit pour calculer le décalage avec l'heure locale.
 * Le compte à rebours s'appuie sur cette heure pour empêcher qu'un
 * utilisateur manipule le compteur en changeant l'horloge de son appareil.
 * Hors-ligne → décalage 0 (heure locale utilisée en attente de sync).
 */
export async function getServerTimeOffset(): Promise<number> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return 0;
    // Sonde par utilisateur : chacun n'écrit que sa propre sonde (règles).
    const probeRef = doc(db, 'syncProbes', uid);
    await setDoc(probeRef, { uid, serverTime: serverTimestamp() }, { merge: true });
    const snap = await getDoc(probeRef);
    const ts = snap.data()?.serverTime;
    if (ts && typeof ts.toMillis === 'function') {
      return ts.toMillis() - Date.now();
    }
    return 0;
  } catch (e) {
    return 0;
  }
}
