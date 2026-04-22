import { useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Task, ScheduledSession, Language } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export const useReminders = (uid: string | undefined, lang: Language = 'fr') => {
  useEffect(() => {
    if (!uid) return;

    // Check tasks for reminders
    const qTasks = query(
      collection(db, 'tasks'), 
      where('uid', '==', uid), 
      where('completed', '==', false),
      where('reminderNotified', '==', false)
    );

    // Check scheduled sessions for reminders
    const qSessions = query(
      collection(db, 'scheduledSessions'), 
      where('uid', '==', uid), 
      where('completed', '==', false),
      where('reminderNotified', '==', false)
    );

    const checkReminders = async (currentTasks: Task[], currentSessions: ScheduledSession[]) => {
      const now = new Date();
      
      // Check tasks
      for (const task of currentTasks) {
        if (task.reminderTime && !task.reminderNotified) {
          const reminderDate = new Date(task.reminderTime);
          if (reminderDate <= now) {
            try {
              await addDoc(collection(db, 'notifications'), {
                uid,
                title: lang === 'ar' ? 'تذكير بمهمة 🔔' : 'Rappel de tâche 🔔',
                message: lang === 'ar' ? `حان الوقت لـ: ${task.title}` : `Il est l'heure de : ${task.title}`,
                type: 'task',
                read: false,
                createdAt: new Date().toISOString()
              });
              await updateDoc(doc(db, 'tasks', task.id), { reminderNotified: true });
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, 'notifications/tasks');
            }
          }
        }
      }

      // Check sessions
      for (const session of currentSessions) {
        if (session.reminderTime && !session.reminderNotified) {
          const reminderDate = new Date(session.reminderTime);
          if (reminderDate <= now) {
            try {
              await addDoc(collection(db, 'notifications'), {
                uid,
                title: lang === 'ar' ? 'تذكير بجلسة دراسة 🔔' : 'Rappel de session 🔔',
                message: lang === 'ar' ? `تبدأ جلستك الآن: ${session.title}` : `Ta session commence : ${session.title}`,
                type: 'info',
                read: false,
                createdAt: new Date().toISOString()
              });
              await updateDoc(doc(db, 'scheduledSessions', session.id), { reminderNotified: true });
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, 'notifications/sessions');
            }
          }
        }
      }
    };

    let localTasks: Task[] = [];
    let localSessions: ScheduledSession[] = [];

    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      localTasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));
      checkReminders(localTasks, localSessions);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tasks');
    });

    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      localSessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScheduledSession));
      checkReminders(localTasks, localSessions);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'scheduledSessions');
    });

    const interval = setInterval(() => {
      checkReminders(localTasks, localSessions);
    }, 30000); // Check every 30 seconds

    return () => {
      unsubTasks();
      unsubSessions();
      clearInterval(interval);
    };
  }, [uid, lang]);
};
