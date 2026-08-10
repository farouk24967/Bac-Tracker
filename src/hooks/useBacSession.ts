import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import {
  BacSession,
  DEFAULT_SESSIONS,
  determineActiveSession,
  ActiveSessionInfo,
  getServerTimeOffset,
  seedBacSessionsIfEmpty,
  seedBacSubjectConfigs,
} from '../lib/bacSessions';

export interface UseBacSessionResult extends ActiveSessionInfo {
  sessions: BacSession[];
  serverOffset: number;
  ready: boolean;
  serverNow: () => number;
}

/**
 * Hook central : fournit la liste des sessions BAC, la session active
 * (déterminée côté serveur par les dates officielles), la précédente,
 * la suivante et l'heure serveur corrigée.
 */
export function useBacSession(): UseBacSessionResult {
  const [sessions, setSessions] = useState<BacSession[]>(DEFAULT_SESSIONS);
  const [serverOffset, setServerOffset] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    (async () => {
      const offset = await getServerTimeOffset();
      setServerOffset(offset);

      try {
        const q = query(collection(db, 'bac_sessions'), orderBy('year', 'asc'));
        unsub = onSnapshot(
          q,
          (snap) => {
            if (snap.empty) {
              seedBacSessionsIfEmpty();
              seedBacSubjectConfigs();
              setSessions(DEFAULT_SESSIONS);
            } else {
              setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() }) as BacSession));
            }
            setReady(true);
          },
          (error) => {
            console.warn('[BacSessions] fallback sur configuration locale :', error);
            setSessions(DEFAULT_SESSIONS);
            setReady(true);
          }
        );
      } catch (e) {
        setSessions(DEFAULT_SESSIONS);
        setReady(true);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const serverNow = useCallback(() => Date.now() + serverOffset, [serverOffset]);

  const info = useMemo(
    () => determineActiveSession(sessions, serverNow()),
    [sessions, serverNow]
  );

  return { ...info, sessions, serverOffset, ready, serverNow };
}
