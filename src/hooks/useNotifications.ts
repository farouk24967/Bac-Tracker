import { useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { Task } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export const useNotifications = (uid: string | undefined) => {
  useEffect(() => {
    if (!uid) return;

    const checkUpcomingTasks = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const path = 'tasks';
      try {
        const q = query(
          collection(db, path),
          where('uid', '==', uid),
          where('completed', '==', false)
        );

        const snapshot = await getDocs(q);
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

        // Filter tasks due today manually since Firestore might need composite index
        const tasksDueToday = tasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate < tomorrow;
        });

        if (tasksDueToday.length > 0) {
          // Check if we already sent a notification for today's tasks
          const notifPath = 'notifications';
          const notifQ = query(
            collection(db, notifPath),
            where('uid', '==', uid),
            where('type', '==', 'task'),
            limit(10)
          );
          
          const notifSnapshot = await getDocs(notifQ);
          const notifs = notifSnapshot.docs.map(d => d.data());
          notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const lastNotif = notifs[0];
          const lastNotifDate = lastNotif ? new Date(lastNotif.createdAt) : null;

          if (!lastNotifDate || lastNotifDate < today) {
            await addDoc(collection(db, notifPath), {
              uid,
              title: 'Tâches du jour',
              message: `Tu as ${tasksDueToday.length} tâches à compléter aujourd'hui. Bon courage !`,
              type: 'task',
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    };

    const sendWelcomeNotification = async () => {
      const path = 'notifications';
      try {
        const notifQ = query(
          collection(db, path),
          where('uid', '==', uid),
          where('type', '==', 'success'),
          limit(1)
        );
        const notifSnapshot = await getDocs(notifQ);
        
        if (notifSnapshot.empty) {
          await addDoc(collection(db, path), {
            uid,
            title: 'Bienvenue sur DzBac !',
            message: 'Ton dashboard est prêt. Commence par définir tes objectifs et tes premières tâches.',
            type: 'success',
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    };

    checkUpcomingTasks();
    sendWelcomeNotification();
  }, [uid]);
};
