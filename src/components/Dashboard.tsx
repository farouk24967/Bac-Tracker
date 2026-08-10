import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  ChevronRight,
  Target,
  Award,
  Zap,
  BookOpen,
  Sparkles,
  Bell,
  Timer,
  RotateCcw,
  History,
  AlertTriangle,
  Coffee,
  Square,
  Play,
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Task, SubjectProgress, Language, ScheduledSession, StudyGoal } from '../types';
import { SUBJECTS_BY_STREAM, STREAMS } from '../constants';
import { cn } from '../lib/utils';
import { StudyGoals } from './StudyGoals';
import { StudyCalendar } from './StudyCalendar';
import { StreakAnimation } from './StreakAnimation';
import { StudySession } from './StudySession';
import { DailyMotivation } from './DailyMotivation';
import { SubjectRaceChart } from './SubjectRaceChart';
import { BacCountdown } from './BacCountdown';
import { Flame } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { updateStreak, checkBadges, checkXPProgression } from '../lib/gamificationUtils';
import { motion, AnimatePresence } from 'motion/react';
import { RewardModal } from './RewardModal';
import { Milestone } from '../lib/xpMilestones';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const locale = (lang: Language) => lang === 'ar' ? 'ar-EG' : lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-FR';

const tDict = {
  fr: {
    greeting: (name: string) => `Bonjour, ${name}`,
    readyToStudy: "Prêt à transformer tes efforts en réussite aujourd'hui ?",
    days: 'Jours',
    streakToBonus: (n: number) => `+${n}j avant le prochain bonus`,
    upcomingSessions: 'Prochaines sessions',
    seeAll: 'Voir tout',
    noSessionsScheduled: 'Aucune session programmée pour le moment.',
    study_session: "Session d'étude",
    today: "Aujourd'hui",
    tasks: 'tâches',
    searchSubject: 'Rechercher une matière...',
    new_task: 'Nouvelle tâche...',
    priorityLow: 'Basse',
    priorityMedium: 'Moyenne',
    priorityHigh: 'Haute',
    subjectLabel: 'Matière',
    add: 'Ajouter',
    reminderLabel: 'Rappel:',
    cancel: 'Annuler',
    allPriorities: 'Priorités',
    dueDateLabel: "Date d'échéance",
    prioritySort: 'Priorité',
    sortAscending: 'Croissant',
    sortDescending: 'Décroissant',
    generalSubject: 'Général',
    progressLabel: 'Progression',
    dragToAdjust: 'Glisser pour ajuster',
    noTasksToday: "Aucune tâche pour aujourd'hui. Profite bien !",
    overviewBySubject: "Vue d'ensemble par matière",
    resetTitle: 'Réinitialiser',
    subjectStatus: 'Statut détaillé par matière',
    completedBadge: 'Terminé',
    goals: 'Objectifs',
    studyGoalsHeader: 'Objectifs de révision',
    reachedGoals: 'atteints',
    noGoals: 'Aucun objectif de révision fixé pour le moment.',
    quickAccess: 'Accès rapide',
    summarizeLesson: 'Résumer cours',
    createQuiz: 'Créer quiz',
    viewSchedule: 'Voir planning',
    planTomorrow: 'Planning demain',
    nothingPlannedTomorrow: 'Rien de prévu pour demain encore.',
    timeStats: 'Statistiques de Temps',
    weeklyStudyRate: "Taux d'heures et minutes d'étude hebdomadaire",
    study: 'Étude',
    deleteTitle: 'Supprimer ?',
    deleteConfirmMsg: (title: string) => `Es-tu sûr de vouloir supprimer "${title}" ?`,
    delete: 'Supprimer',
    performanceOptimized: 'Performance optimisée',
    focusTitle: 'Focus',
    details: 'Détails',
    neglectedSubjects: 'Matières Négligées',
    weakSubjects: 'Matières Faibles',
    allUnderControl: 'Tout est sous contrôle !',
    focus: 'Focus',
    pause: 'Pause',
    chooseSubject: 'Matière à réviser',
    startSession: 'Démarrer session',
    stopSession: 'Arrêter session',
    memoryOfToday: 'Mémoire du jour',
    completedLog: (title: string) => `Terminé : ${title}`,
    noMemories: 'Aucun souvenir pour le moment.',
    reminderTitle: 'Rappel de tâche ! 🔔',
    reminderMessage: (title: string) => `C'est l'heure de : ${title}`,
    streakBrokenTitle: 'Série interrompue ⚠️',
    streakBrokenMessage: "Tu as manqué un jour ! Recommence une série aujourd'hui.",
    newDayTitle: 'Nouvelle journée ! ✨',
    newDayMessage: 'Les tâches et graphiques ont été réinitialisés pour une nouvelle journée de réussite.',
    taskCompletedTitle: 'Tâche terminée ✅',
    taskCompletedMsg: (title: string) => `Bravo 🎉 tu as terminé "${title}" ! (+10 XP)`,
    streakTitle: 'Streak 🔥',
    streakMsg: (days: number) => `Tu es à ${days} jours de streak 🔥 continue ! (+XP Bonus)`,
    reminderSetTitle: 'Rappel configuré 🔔',
    reminderSetMessage: 'On te rappellera ça le moment venu !',
    progressResetTitle: 'Progression réinitialisée',
    progressResetMessage: 'Toutes les progressions ont été remises à zéro.'
  },
  en: {
    greeting: (name: string) => `Hello, ${name}`,
    readyToStudy: 'Ready to turn your effort into success today?',
    days: 'Days',
    streakToBonus: (n: number) => `+${n}d before the next bonus`,
    upcomingSessions: 'Upcoming sessions',
    seeAll: 'View all',
    noSessionsScheduled: 'No sessions scheduled for now.',
    study_session: 'Study Session',
    today: 'Today',
    tasks: 'tasks',
    searchSubject: 'Search for a subject...',
    new_task: 'New task...',
    priorityLow: 'Low',
    priorityMedium: 'Medium',
    priorityHigh: 'High',
    subjectLabel: 'Subject',
    add: 'Add',
    reminderLabel: 'Reminder:',
    cancel: 'Cancel',
    allPriorities: 'All priorities',
    dueDateLabel: 'Due date',
    prioritySort: 'Priority',
    sortAscending: 'Ascending',
    sortDescending: 'Descending',
    generalSubject: 'General',
    progressLabel: 'Progress',
    dragToAdjust: 'Drag to adjust',
    noTasksToday: 'No tasks for today. Enjoy your time!',
    overviewBySubject: 'Overview by subject',
    resetTitle: 'Reset',
    subjectStatus: 'Detailed status by subject',
    completedBadge: 'Completed',
    goals: 'Goals',
    studyGoalsHeader: 'Study goals',
    reachedGoals: 'reached',
    noGoals: 'No study goals set for now.',
    quickAccess: 'Quick access',
    summarizeLesson: 'Summarize lesson',
    createQuiz: 'Create quiz',
    viewSchedule: 'View schedule',
    planTomorrow: 'Plan tomorrow',
    nothingPlannedTomorrow: 'Nothing planned for tomorrow yet.',
    timeStats: 'Time statistics',
    weeklyStudyRate: 'Weekly study hours and minutes rate',
    study: 'Study',
    deleteTitle: 'Delete?',
    deleteConfirmMsg: (title: string) => `Are you sure you want to delete "${title}"?`,
    delete: 'Delete',
    performanceOptimized: 'Optimized performance',
    focusTitle: 'Focus',
    details: 'Details',
    neglectedSubjects: 'Neglected Subjects',
    weakSubjects: 'Weak Subjects',
    allUnderControl: 'Everything is under control!',
    focus: 'Focus',
    pause: 'Break',
    chooseSubject: 'Subject to review',
    startSession: 'Start session',
    stopSession: 'Stop session',
    memoryOfToday: 'Memory of the day',
    completedLog: (title: string) => `Completed: ${title}`,
    noMemories: 'No memories for now.',
    reminderTitle: 'Task reminder! 🔔',
    reminderMessage: (title: string) => `It's time for: ${title}`,
    streakBrokenTitle: 'Streak broken ⚠️',
    streakBrokenMessage: 'You missed a day! Start a new streak today.',
    newDayTitle: 'New day! ✨',
    newDayMessage: 'Tasks and charts have been reset for a new day of success.',
    taskCompletedTitle: 'Task completed ✅',
    taskCompletedMsg: (title: string) => `Well done 🎉 you finished "${title}"! (+10 XP)`,
    streakTitle: 'Streak 🔥',
    streakMsg: (days: number) => `You're on a ${days} day streak 🔥 keep going! (+XP Bonus)`,
    reminderSetTitle: 'Reminder set 🔔',
    reminderSetMessage: "We'll remind you when the time comes!",
    progressResetTitle: 'Progress reset',
    progressResetMessage: 'All progressions have been reset to zero.'
  },
  es: {
    greeting: (name: string) => `Hola, ${name}`,
    readyToStudy: '¿Listo para convertir tu esfuerzo en éxito hoy?',
    days: 'Días',
    streakToBonus: (n: number) => `+${n}d para el próximo bonus`,
    upcomingSessions: 'Próximas sesiones',
    seeAll: 'Ver todo',
    noSessionsScheduled: 'No hay sesiones programadas por ahora.',
    study_session: 'Sesión de estudio',
    today: 'Hoy',
    tasks: 'tareas',
    searchSubject: 'Buscar una materia...',
    new_task: 'Nueva tarea...',
    priorityLow: 'Baja',
    priorityMedium: 'Media',
    priorityHigh: 'Alta',
    subjectLabel: 'Materia',
    add: 'Añadir',
    reminderLabel: 'Recordatorio:',
    cancel: 'Cancelar',
    allPriorities: 'Todas las prioridades',
    dueDateLabel: 'Fecha de vencimiento',
    prioritySort: 'Prioridad',
    sortAscending: 'Ascendente',
    sortDescending: 'Descendente',
    generalSubject: 'General',
    progressLabel: 'Progreso',
    dragToAdjust: 'Arrastra para ajustar',
    noTasksToday: 'No hay tareas para hoy. ¡Disfruta!',
    overviewBySubject: 'Resumen por materia',
    resetTitle: 'Restablecer',
    subjectStatus: 'Estado detallado por materia',
    completedBadge: 'Completado',
    goals: 'Objetivos',
    studyGoalsHeader: 'Objetivos de revisión',
    reachedGoals: 'alcanzados',
    noGoals: 'No hay objetivos de revisión fijados por ahora.',
    quickAccess: 'Acceso rápido',
    summarizeLesson: 'Resumir lección',
    createQuiz: 'Crear quiz',
    viewSchedule: 'Ver planificación',
    planTomorrow: 'Plan de mañana',
    nothingPlannedTomorrow: 'Nada planificado para mañana todavía.',
    timeStats: 'Estadísticas de tiempo',
    weeklyStudyRate: 'Tasa de horas y minutos de estudio semanal',
    study: 'Estudio',
    deleteTitle: '¿Eliminar?',
    deleteConfirmMsg: (title: string) => `¿Seguro que quieres eliminar "${title}"?`,
    delete: 'Eliminar',
    performanceOptimized: 'Rendimiento optimizado',
    focusTitle: 'Foco',
    details: 'Detalles',
    neglectedSubjects: 'Materias Descuidadas',
    weakSubjects: 'Materias Débiles',
    allUnderControl: '¡Todo bajo control!',
    focus: 'Enfoque',
    pause: 'Descanso',
    chooseSubject: 'Materia a repasar',
    startSession: 'Iniciar sesión',
    stopSession: 'Detener sesión',
    memoryOfToday: 'Memoria del día',
    completedLog: (title: string) => `Completado: ${title}`,
    noMemories: 'No hay recuerdos por ahora.',
    reminderTitle: '¡Recordatorio de tarea! 🔔',
    reminderMessage: (title: string) => `Es hora de: ${title}`,
    streakBrokenTitle: 'Racha interrumpida ⚠️',
    streakBrokenMessage: '¡Has faltado un día! Empieza una nueva racha hoy.',
    newDayTitle: '¡Nuevo día! ✨',
    newDayMessage: 'Las tareas y gráficos se han reiniciado para un nuevo día de éxito.',
    taskCompletedTitle: 'Tarea completada ✅',
    taskCompletedMsg: (title: string) => `¡Bien hecho 🎉 has terminado "${title}"! (+10 XP)`,
    streakTitle: 'Racha 🔥',
    streakMsg: (days: number) => `¡Llevas una racha de ${days} días 🔥 sigue así! (+XP Bonus)`,
    reminderSetTitle: 'Recordatorio configurado 🔔',
    reminderSetMessage: '¡Te lo recordaremos cuando llegue el momento!',
    progressResetTitle: 'Progreso restablecido',
    progressResetMessage: 'Todas las progresiones se han puesto a cero.'
  },
  ar: {
    greeting: (name: string) => `مرحباً، ${name}`,
    readyToStudy: 'جاهز للدراسة اليوم؟',
    days: 'أيام',
    streakToBonus: (n: number) => `${n} أيام للمكافأة القادمة`,
    upcomingSessions: 'الجلسات القادمة',
    seeAll: 'رؤية الكل',
    noSessionsScheduled: 'لا توجد جلسات مبرمجة حالياً.',
    study_session: 'جلسة مراجعة',
    today: 'اليوم',
    tasks: 'مهام',
    searchSubject: 'البحث عن مادة...',
    new_task: 'مهمة جديدة...',
    priorityLow: 'منخفضة',
    priorityMedium: 'متوسطة',
    priorityHigh: 'عالية',
    subjectLabel: 'المادة',
    add: 'إضافة',
    reminderLabel: 'تذكير:',
    cancel: 'إلغاء',
    allPriorities: 'كل الأولويات',
    dueDateLabel: 'تاريخ الاستحقاق',
    prioritySort: 'الأولوية',
    sortAscending: 'تصاعدي',
    sortDescending: 'تنازلي',
    generalSubject: 'عام',
    progressLabel: 'التقدم',
    dragToAdjust: 'اسحب للتعديل',
    noTasksToday: 'لا توجد مهام لليوم. استمتع بوقتك!',
    overviewBySubject: 'نظرة عامة حسب المادة',
    resetTitle: 'إعادة ضبط',
    subjectStatus: 'حالة المواد',
    completedBadge: 'مكتمل',
    goals: 'أهداف',
    studyGoalsHeader: 'أهداف الدراسة',
    reachedGoals: 'مكتمل',
    noGoals: 'لم يتم تحديد أهداف مراجعة بعد.',
    quickAccess: 'وصول سريع',
    summarizeLesson: 'تلخيص درس',
    createQuiz: 'إنشاء كويز',
    viewSchedule: 'رؤية الجدول',
    planTomorrow: 'تخطيط الغد',
    nothingPlannedTomorrow: 'لا يوجد شيء مخطط له غداً بعد.',
    timeStats: 'إحصائيات الوقت',
    weeklyStudyRate: 'معدل الساعات والدقائق',
    study: 'دراسة',
    deleteTitle: 'حذف المهمة؟',
    deleteConfirmMsg: (title: string) => `هل أنت متأكد أنك تريد حذف "${title}"؟`,
    delete: 'حذف',
    performanceOptimized: 'أداء محسّن',
    focusTitle: 'نقاط اليقظة',
    details: 'التفاصيل',
    neglectedSubjects: 'مواد مهملة',
    weakSubjects: 'مواد ضعيفة',
    allUnderControl: 'كل شيء تحت السيطرة !',
    focus: 'عمل',
    pause: 'راحة',
    chooseSubject: 'اختر مادة للتركيز',
    startSession: 'ابدأ الجلسة',
    stopSession: 'إيقاف الجلسة',
    memoryOfToday: 'ذاكرة اليوم',
    completedLog: (title: string) => `أكملت: ${title}`,
    noMemories: 'لا توجد ذكريات حالياً.',
    reminderTitle: 'تذكير بالمهمة! 🔔',
    reminderMessage: (title: string) => `حان وقت: ${title}`,
    streakBrokenTitle: 'انقطعت السلسلة ⚠️',
    streakBrokenMessage: 'لقد فاتك يوم! ابدأ سلسلة جديدة اليوم.',
    newDayTitle: 'يوم جديد! ✨',
    newDayMessage: 'تم إعادة ضبط المهام والرسوم البيانية ليوم جديد من النجاح.',
    taskCompletedTitle: 'اكتملت المهمة ✅',
    taskCompletedMsg: (title: string) => `أحسنت 🎉 لقد انتهيت من "${title}"! (+10 XP)`,
    streakTitle: 'سلسلة 🔥',
    streakMsg: (days: number) => `أنت في سلسلة من ${days} أيام 🔥 استمر! (+XP Bonus)`,
    reminderSetTitle: 'تم ضبط التذكير 🔔',
    reminderSetMessage: 'سوف نذكرك في البكالوريا!',
    progressResetTitle: 'تم إعادة ضبط التقدم',
    progressResetMessage: 'تم تصفير جميع نسب التقدم.'
  }
};

interface DashboardProps {
  userProfile: UserProfile;
  onTabChange?: (tab: string) => void;
  onManualSessionChange?: (isActive: boolean) => void;
}

const getSubjectColor = (subject: string = '') => {
  const s = subject.toLowerCase();
  if (s.includes('math') || s.includes('رياضيات')) return { bg: 'bg-primary-50', border: 'border-primary-100', text: 'text-primary-700', marker: 'bg-primary-500', light: 'bg-primary-100' };
  if (s.includes('physique') || s.includes('فيزياء')) return { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', marker: 'bg-sky-500', light: 'bg-sky-100' };
  if (s.includes('science') || s.includes('علوم الطبيعة')) return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', marker: 'bg-emerald-500', light: 'bg-emerald-100' };
  if (s.includes('philo') || s.includes('فلسفة')) return { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', marker: 'bg-purple-500', light: 'bg-purple-100' };
  if (s.includes('arabe') || s.includes('العربية')) return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', marker: 'bg-amber-500', light: 'bg-amber-100' };
  if (s.includes('français') || s.includes('الفرنسية')) return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', marker: 'bg-rose-500', light: 'bg-rose-100' };
  if (s.includes('anglais') || s.includes('english') || s.includes('الإنجليزية')) return { bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-700', marker: 'bg-pink-500', light: 'bg-pink-100' };
  if (s.includes('hist') || s.includes('geo') || s.includes('تاريخ') || s.includes('جغرافيا')) return { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', marker: 'bg-orange-500', light: 'bg-orange-100' };
  if (s.includes('islam') || s.includes('شريعة') || s.includes('إسلامية')) return { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-700', marker: 'bg-teal-500', light: 'bg-teal-100' };
  if (s.includes('compt') || s.includes('محاسبة') || s.includes('تسيير')) return { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', marker: 'bg-violet-500', light: 'bg-violet-100' };
  if (s.includes('techno') || s.includes('تكنولوجيا')) return { bg: 'bg-lime-50', border: 'border-lime-100', text: 'text-lime-700', marker: 'bg-lime-500', light: 'bg-lime-100' };
  if (s.includes('info') || s.includes('إعلام')) return { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-700', marker: 'bg-cyan-500', light: 'bg-cyan-100' };
  if (s.includes('droit') || s.includes('قانون')) return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', marker: 'bg-red-500', light: 'bg-red-100' };
  if (s.includes('eco') || s.includes('اقتصاد')) return { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-700', marker: 'bg-cyan-500', light: 'bg-cyan-100' };
  return { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', marker: 'bg-slate-500', light: 'bg-slate-100' };
};

export const Dashboard: React.FC<DashboardProps> = ({ userProfile, onTabChange, onManualSessionChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([]);
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [taskSortOrder, setTaskSortOrder] = useState<'asc' | 'desc'>('asc');
  const [taskSortBy, setTaskSortBy] = useState<'date' | 'priority'>('date');
  const [rewardModal, setRewardModal] = useState<{ isOpen: boolean; xpEarned?: number; milestone?: Milestone }>({ isOpen: false });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showStreakAnim, setShowStreakAnim] = useState(false);
  const streamRaw = (userProfile.stream || STREAMS[0]).trim();
  const stream = STREAMS.find(s => s === streamRaw || s.toLowerCase() === streamRaw.toLowerCase()) || STREAMS[0];
  const subjects = SUBJECTS_BY_STREAM[stream] || [];
  const lang: Language = userProfile.language || 'fr';
  const t = tDict[lang] || tDict.fr;

  useEffect(() => {
    const path = 'tasks';
    const q = query(collection(db, path), where('uid', '==', userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  useEffect(() => {
    const path = 'subjectProgress';
    const q = query(collection(db, path), where('uid', '==', userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProgress(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectProgress)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  useEffect(() => {
    const path = 'studySessions';
    const q = query(
      collection(db, path), 
      where('uid', '==', userProfile.uid),
      orderBy('date', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudySessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  useEffect(() => {
    // Task Reminder Background Checker
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(async (task) => {
        if (task.reminderTime && !task.reminderNotified && !task.completed) {
          const reminderDate = new Date(task.reminderTime);
          if (reminderDate <= now) {
            // Trigger Notification
            sendTaskNotification(task);
            
            // Mark as notified in DB
            await updateDoc(doc(db, 'tasks', task.id), { 
              reminderNotified: true 
            });
          }
        }
      });
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [tasks, userProfile.uid, lang]);

  const sendTaskNotification = async (task: Task) => {
    const title = t.reminderTitle;
    const message = t.reminderMessage(task.title);
    
    // 1. In-app notification
    await addNotification(title, message, 'task');

    // 2. System notification (Browser)
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification(title, {
            body: message,
            icon: '/favicon.ico'
          });
        } catch (e) {
          console.error("Error showing system notification", e);
        }
      }
    }
  };

  useEffect(() => {
    const path = 'scheduledSessions';
    const q = query(collection(db, path), where('uid', '==', userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setScheduledSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduledSession)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  useEffect(() => {
    const path = 'studyGoals';
    const q = query(collection(db, path), where('uid', '==', userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudyGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyGoal)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  useEffect(() => {
    const performDailyReset = async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastReset = userProfile.lastLoginDate;
      const lastActivity = userProfile.lastActivityDate;
      
      if (lastReset === today) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const updates: any = {
        lastLoginDate: today
      };

      // 1. Streak Reset Logic (Only if they haven't done a task since yesterday)
      if (lastActivity !== today && lastActivity !== yesterdayStr && lastActivity !== undefined) {
        updates.currentStreak = 0;
        await addNotification(
          t.streakBrokenTitle, 
          t.streakBrokenMessage, 
          'warning'
        );
      }

      // 2. Daily Graph Reset (Subject Progress)
      const progressDocs = await getDocs(query(collection(db, 'subjectProgress'), where('uid', '==', userProfile.uid)));
      const progressBatch = progressDocs.docs.map(d => updateDoc(doc(db, 'subjectProgress', d.id), { progress: 0 }));
      await Promise.all(progressBatch);

      // 3. Tasks Reset (Uncheck all or clear completed)
      const taskDocs = await getDocs(query(collection(db, 'tasks'), where('uid', '==', userProfile.uid)));
      const taskBatch = taskDocs.docs.map(d => updateDoc(doc(db, 'tasks', d.id), { 
        completed: false, 
        progress: 0,
        reminderNotified: false 
      }));
      await Promise.all(taskBatch);

      // Apply updates to user profile
      await updateDoc(doc(db, 'users', userProfile.uid), updates);

      await addNotification(
        t.newDayTitle,
        t.newDayMessage,
        'success'
      );
    };

    performDailyReset();
  }, [userProfile.uid, userProfile.lastLoginDate]);

  const addNotification = async (title: string, message: string, type: 'info' | 'warning' | 'success' | 'task') => {
    await addDoc(collection(db, 'notifications'), {
      uid: userProfile.uid,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    });
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    let reminderISO = null;
    if (reminderTime) {
      try {
        reminderISO = new Date(reminderTime).toISOString();
      } catch (e) {
        console.error("Invalid reminder date", e);
      }
    }

    await addDoc(collection(db, 'tasks'), {
      uid: userProfile.uid,
      title: newTaskTitle,
      subject: selectedSubject || 'Général',
      completed: false,
      progress: 0,
      dueDate: new Date().toISOString(),
      priority: newTaskPriority,
      reminderTime: reminderISO || null,
      reminderNotified: false
    });
    setNewTaskTitle('');
    setSelectedSubject('');
    setReminderTime('');

    // Award "planner" badge if first task
    await checkBadges(userProfile, { action: 'task_created' });
  };

  const handleTaskCompletion = async (task: Task, isCompleted: boolean) => {
    // Update subject progress based on tasks
    const subjectTasks = tasks.filter(t => t.subject === task.subject);
    const completedCount = subjectTasks.filter(t => t.id === task.id ? isCompleted : t.completed).length;
    const totalCount = subjectTasks.length;
    const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    await updateProgress(task.subject, newProgress);

    // Add to activity log (Memory)
    if (isCompleted) {
      const pointsEarned = 10;
      await updateDoc(doc(db, 'users', userProfile.uid), {
        points: userProfile.points + pointsEarned
      });

      await addDoc(collection(db, 'activityLog'), {
        uid: userProfile.uid,
        type: 'task_completed',
        title: task.title,
        subject: task.subject,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        xpEarned: pointsEarned + (userProfile.lastActivityDate !== new Date().toISOString().split('T')[0] ? 50 : 0)
      });

      // Task completed notification
      await addNotification(t.taskCompletedTitle, t.taskCompletedMsg(task.title), 'success');

      // Streak logic
      const newStreak = await updateStreak(userProfile);
      if (newStreak > userProfile.currentStreak) {
        setShowStreakAnim(true);
        await addNotification(t.streakTitle, t.streakMsg(newStreak), 'success');
      }

      // Check badges
      const totalCompleted = tasks.filter(t => t.completed).length + 1;
      
      // Weekly count logic
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const q = query(
        collection(db, 'activityLog'),
        where('uid', '==', userProfile.uid),
        where('type', '==', 'task_completed'),
        where('timestamp', '>=', sevenDaysAgo.toISOString())
      );
      const snapshot = await getDocs(q);
      const weeklyCount = snapshot.size;

      await checkBadges(userProfile, { 
        action: 'task_completed', 
        metadata: { 
          totalCompleted,
          weeklyCount
        } 
      });

      // Check XP Milestone
      const milestone = await checkXPProgression(userProfile, (userProfile.points || 0) + 10);
      setRewardModal({
        isOpen: true,
        xpEarned: 10,
        milestone: milestone || undefined
      });
    }
  };

  const toggleTask = async (task: Task) => {
    const newStatus = !task.completed;
    await updateDoc(doc(db, 'tasks', task.id), { 
      completed: newStatus,
      progress: newStatus ? 100 : 0
    });
    
    await handleTaskCompletion(task, newStatus);
  };

  const setTaskReminder = async (taskId: string, dateTime: string) => {
    // Request notification permission if needed
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.error("Error requesting notification permission", e);
      }
    }

    if (!dateTime) {
      await updateDoc(doc(db, 'tasks', taskId), { 
        reminderTime: null,
        reminderNotified: false
      });
      return;
    }

    try {
      const isoString = new Date(dateTime).toISOString();
      await updateDoc(doc(db, 'tasks', taskId), { 
        reminderTime: isoString,
        reminderNotified: false
      });
      
      await addNotification(
        t.reminderSetTitle,
        t.reminderSetMessage,
        'success'
      );
    } catch (e) {
      console.error("Invalid date for reminder", e);
    }
  };

  const updateTaskProgress = async (taskId: string, val: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isNewlyCompleted = val === 100 && !task.completed;
    const isNewlyUncompleted = val < 100 && task.completed;

    await updateDoc(doc(db, 'tasks', taskId), { 
      progress: val,
      completed: val === 100
    });

    if (isNewlyCompleted || isNewlyUncompleted) {
      await handleTaskCompletion(task, val === 100);
    }
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      await deleteDoc(doc(db, 'tasks', taskToDelete.id));
      setTaskToDelete(null);
    }
  };

  const updateProgress = async (subjectId: string, val: number) => {
    const existing = progress.find(p => p.subjectId === subjectId);
    if (existing) {
      await updateDoc(doc(db, 'subjectProgress', existing.id), { progress: val });
    } else {
      await addDoc(collection(db, 'subjectProgress'), {
        uid: userProfile.uid,
        subjectId,
        progress: val,
        strength: 3
      });
    }

    if (val === 100) {
      await checkBadges(userProfile, { action: 'task_completed', metadata: { isTopStudent: true } });
    }
  };

  const resetProgress = async () => {
    const batch = progress.map(p => updateDoc(doc(db, 'subjectProgress', p.id), { progress: 0 }));
    await Promise.all(batch);
    
    await addNotification(
      t.progressResetTitle,
      t.progressResetMessage,
      'info'
    );
  };

  const overallProgress = subjects.length > 0 && progress.length > 0 
    ? Math.round(progress.reduce((acc, curr) => acc + curr.progress, 0) / subjects.length)
    : 0;

  const chartData = subjects.map(s => {
    const sProgress = progress.find(p => p.subjectId === s)?.progress || 0;
    const sTasks = tasks.filter(t => t.subject === s);
    const sSessions = scheduledSessions.filter(sess => sess.subjectId === s);
    const sGoals = studyGoals.filter(g => g.subject === s || (!g.subject && g.title.toLowerCase().includes(s.toLowerCase())));

    const totalTasks = sTasks.length + sSessions.length;
    const completedTasks = sTasks.filter(t => t.completed).length + sSessions.filter(sess => sess.completed).length;
    const goalsCompleted = sGoals.length > 0 ? sGoals.every(g => g.currentValue >= g.targetValue) : true;
    
    const isFinished = (totalTasks > 0 || sGoals.length > 0) && 
                      (totalTasks === completedTasks) && 
                      goalsCompleted;

    return {
      name: s.substring(0, 8),
      fullName: s,
      progress: sProgress,
      isFinished,
      totalTasks,
      completedTasks,
      hasGoals: sGoals.length > 0,
      goalsCompleted
    };
  });

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const studyTimeData = last7Days.map(date => {
    const daySessions = studySessions.filter(s => s.date === date);
    const totalSeconds = daySessions.reduce((acc, curr) => acc + curr.duration, 0);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return {
      date: date.split('-').slice(2).join('/'),
      hours: Number((totalSeconds / 3600).toFixed(1)),
      minutes: totalMinutes,
      displayTime: `${hours}h ${minutes}m`,
      fullDate: date
    };
  });

  // Date filtering
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const todayTasks = tasks.filter(t => t.dueDate.split('T')[0] === today);
  const tomorrowTasks = tasks.filter(t => t.dueDate.split('T')[0] === tomorrowStr);
  
  const completedToday = todayTasks.filter(t => t.completed).length;
  const filteredTodayTasks = todayTasks
    .filter(t => taskPriorityFilter === 'all' || t.priority === taskPriorityFilter)
    .sort((a, b) => {
      if (taskSortBy === 'date') {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return taskSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const valA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const valB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return taskSortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });

  const dailyProgress = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const neglectedSubjects = subjects
    .map(s => {
      const lastTask = tasks.find(t => t.subject === s);
      const days = lastTask 
        ? Math.floor((Date.now() - new Date(lastTask.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      return { name: s, days };
    })
    .filter(s => s.days > 3)
    .sort((a, b) => b.days - a.days)
    .slice(0, 3);

  const weakSubjects = userProfile.aiAnalysis?.weaknesses?.slice(0, 3) || [];

  const upcomingSessions = scheduledSessions
    .filter(session => {
      if (session.completed) return false;
      const sessionDate = new Date(`${session.date}T${session.startTime || '00:00'}`);
      return sessionDate > new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.startTime || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      <DailyMotivation userProfile={userProfile} inline={true} />
      
      <StreakAnimation 
        streak={userProfile.currentStreak || 0} 
        isVisible={showStreakAnim} 
        onClose={() => setShowStreakAnim(false)} 
        lang={lang}
      />

      <RewardModal
        isOpen={rewardModal.isOpen}
        onClose={() => setRewardModal({ isOpen: false })}
        xpEarned={rewardModal.xpEarned}
        milestone={rewardModal.milestone}
        lang={lang}
      />
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-5 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[32px] bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-100 relative group overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="text-2xl md:text-3xl font-black relative z-10">{userProfile.displayName?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
                {t.greeting(userProfile.displayName)} 👋
              </h2>
              {userProfile.title && (
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary-600 text-white text-[8px] md:text-[10px] font-black rounded-full shadow-sm">
                  {userProfile.title}
                </span>
              )}
            </div>
            <p className="text-slate-500 font-medium text-sm md:text-lg">
              {t.readyToStudy}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex-1 md:flex-none bg-orange-50 px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-[32px] flex items-center gap-3 md:gap-4 border border-orange-100 shadow-sm"
          >
            <div className="bg-orange-100 p-2 rounded-xl">
              <Flame className="w-6 h-6 md:w-8 md:h-8 text-orange-600 fill-orange-600" />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">Streak</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl md:text-2xl font-black text-orange-600 leading-none">{userProfile.currentStreak || 0} {t.days}</p>
                {userProfile.currentStreak > 0 && userProfile.currentStreak < 7 && (
                  <span className="text-[9px] font-bold text-orange-400/80 italic">
                    {t.streakToBonus(userProfile.currentStreak < 3 ? 3 - userProfile.currentStreak : 7 - userProfile.currentStreak)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 1.5. Prochaines Sessions Section */}
      <div className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h3 className="text-lg md:text-2xl font-black text-slate-900 flex items-center gap-2 md:gap-3">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
            {t.upcomingSessions}
          </h3>
          <button 
            onClick={() => onTabChange?.('calendar')}
            className="text-primary-600 font-bold text-xs md:text-sm hover:underline"
          >
            {t.seeAll}
          </button>
        </div>
        
        {upcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingSessions.map(session => (
              <div key={session.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-primary-200 transition-all">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="bg-white p-2.5 rounded-2xl shadow-sm text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                     <Clock className="w-5 h-5" />
                   </div>
                   <div className="overflow-hidden">
                     <p className="font-black text-slate-900 truncate">{session.title}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{session.subjectId || 'Général'}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="truncate">{new Date(session.date).toLocaleDateString(locale(lang), { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{session.startTime || '--:--'}</span>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
            <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Calendar className="w-6 h-6 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold italic text-sm">
              {t.noSessionsScheduled}
            </p>
          </div>
        )}
      </div>

      {/* 2. Top Info Grid (Points de Vigilance, Countdown, Session d'étude) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Points de Vigilance */}
        <AnalyticsSummary 
          neglected={neglectedSubjects} 
          weak={weakSubjects} 
          lang={lang} 
          onViewAnalytics={() => onTabChange?.('analytics')}
        />

        {/* Compte à Rebours */}
        <BacCountdown lang={lang} userProfile={userProfile} />

        {/* Session d'étude / Pomodoro */}
        <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-primary-50 p-2.5 rounded-xl text-primary-600">
              <Timer className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-900">{t.study_session}</h3>
              <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-0.5">Focus Mode</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <PomodoroModule 
              userProfile={userProfile} 
              onStreakUpdate={() => setShowStreakAnim(true)} 
              setIsManualActive={onManualSessionChange}
              subjects={subjects}
              onXPEarned={async (xp) => {
                const milestone = await checkXPProgression(userProfile, (userProfile.points || 0) + xp);
                setRewardModal({
                  isOpen: true,
                  xpEarned: xp,
                  milestone: milestone || undefined
                });
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* 2. Section "Aujourd'hui" */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900">{t.today}</h3>
                <p className="text-slate-400 font-medium text-xs md:text-sm mt-1">
                  {completedToday}/{todayTasks.length} {t.tasks}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-black text-primary-600">{dailyProgress}%</p>
                <div className="w-24 md:w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dailyProgress}%` }}
                    className="h-full bg-primary-600 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-4 mb-8">
                {/* Subject Search and Chips */}
                <div className="space-y-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                      type="text"
                      value={subjectSearch}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                      placeholder={t.searchSubject}
                      className="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-6 py-3 text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium text-slate-600 shadow-inner"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {subjects
                      .filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase()))
                      .map(s => {
                        const colors = getSubjectColor(s);
                        const isSelected = selectedSubject === s;
                        const subjectData = chartData.find(d => d.fullName === s);
                        const isFinished = subjectData?.isFinished;
                        
                        return (
                          <button
                            key={s}
                            onClick={() => setSelectedSubject(isSelected ? "" : s)}
                            className={cn(
                              "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 flex items-center gap-2",
                              isSelected 
                                ? cn(colors.marker, "text-white border-transparent shadow-md") 
                                : cn("bg-white border-slate-100 text-slate-400 hover:border-primary-200"),
                              isFinished && !isSelected && "bg-emerald-50 text-emerald-600 border-emerald-100"
                            )}
                          >
                            {isFinished && <CheckCircle2 className="w-3 h-3" />}
                            {s}
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder={t.new_task}
                      className="flex-1 min-w-[200px] bg-slate-50 border-2 border-transparent focus:border-primary-500 rounded-2xl px-6 py-4 text-sm outline-none transition-all shadow-inner"
                    />
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="bg-slate-50 border-2 border-transparent focus:border-primary-500 rounded-2xl px-4 py-4 text-sm outline-none transition-all text-slate-600 font-bold shadow-inner"
                    >
                      <option value="low">{t.priorityLow}</option>
                      <option value="medium">{t.priorityMedium}</option>
                      <option value="high">{t.priorityHigh}</option>
                    </select>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="bg-slate-50 border-2 border-transparent focus:border-primary-500 rounded-2xl px-4 py-4 text-sm outline-none transition-all text-slate-600 font-bold max-w-[150px] shadow-inner"
                    >
                      <option value="">{t.subjectLabel}</option>
                      {subjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={addTask}
                    disabled={!newTaskTitle.trim()}
                    className={cn(
                      "p-4 rounded-2xl transition-all flex items-center justify-center gap-2 shrink-0 md:w-32",
                      newTaskTitle.trim() 
                        ? "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-100" 
                        : "bg-slate-100 text-slate-300 pointer-events-none"
                    )}
                  >
                    <Plus className="w-6 h-6" />
                    <span className="font-bold">{t.add}</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-3 px-2">
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">{t.reminderLabel}</span>
                    <input 
                      type="time" 
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-bold text-primary-600"
                    />
                  </div>
                  {reminderTime && (
                    <button 
                      onClick={() => setReminderTime('')}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest"
                    >
                      {t.cancel}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 py-4 mt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select 
                        value={taskPriorityFilter}
                        onChange={(e) => setTaskPriorityFilter(e.target.value as any)}
                        className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer"
                      >
                        <option value="all">{t.allPriorities}</option>
                        <option value="high">{t.priorityHigh}</option>
                        <option value="medium">{t.priorityMedium}</option>
                        <option value="low">{t.priorityLow}</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <select 
                        value={taskSortBy}
                        onChange={(e) => setTaskSortBy(e.target.value as any)}
                        className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer"
                      >
                        <option value="date">{t.dueDateLabel}</option>
                        <option value="priority">{t.prioritySort}</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => setTaskSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:border-primary-200 transition-all group"
                    >
                      {taskSortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 transition-colors" /> : <ArrowDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 transition-colors" />}
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {taskSortOrder === 'asc' ? t.sortAscending : t.sortDescending}
                      </span>
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {filteredTodayTasks.length > 0 ? Object.entries(
                    filteredTodayTasks.reduce((acc, task) => {
                      const subj = task.subject || t.generalSubject;
                      if (!acc[subj]) acc[subj] = [];
                      acc[subj].push(task);
                      return acc;
                    }, {} as Record<string, Task[]>)
                  ).map(([subject, subjectTasks]) => {
                    const colors = getSubjectColor(subject);
                    return (
                      <motion.div
                        key={subject}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2 px-1">
                          <div className={cn("w-2 h-4 rounded-full", colors.marker)} />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {subject} • {subjectTasks.length} {t.tasks}
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {subjectTasks.map(task => (
                            <motion.div
                              key={task.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={cn(
                                "group flex items-center gap-4 p-5 rounded-3xl border transition-all duration-500",
                                task.completed 
                                  ? "bg-gradient-to-r from-emerald-50 to-slate-50 border-emerald-100/50 opacity-80" 
                                  : cn("bg-white shadow-sm hover:shadow-md", colors.border)
                              )}
                            >
                              <button
                                onClick={() => toggleTask(task)}
                                className={cn(
                                  "relative w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-colors duration-300",
                                  task.completed 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200' 
                                    : cn('bg-slate-50 border-slate-200', `hover:border-${colors.marker.split('-')[1]}-400`)
                                )}
                              >
                                <AnimatePresence>
                                  {task.completed && (
                                    <>
                                      <motion.div
                                        key="check"
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 45 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        className="absolute z-10"
                                      >
                                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                                      </motion.div>
                                      <motion.div
                                        key="ripple"
                                        initial={{ scale: 0.8, opacity: 0.8 }}
                                        animate={{ scale: 2.5, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="absolute inset-0 rounded-xl bg-emerald-400"
                                      />
                                    </>
                                  )}
                                </AnimatePresence>
                              </button>
                              <div className="flex-1">
                                <p className={cn(
                                  "font-bold text-slate-800 transition-all duration-300",
                                  task.completed && "line-through text-slate-400/70"
                                )}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-3">
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest leading-none px-2 py-0.5 rounded-full",
                                    task.completed ? "bg-slate-200 text-slate-500" : cn(colors.light, colors.text)
                                  )}>
                                    {task.subject}
                                  </span>
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest leading-none px-2 py-0.5 rounded-full",
                                    task.priority === 'high' ? "bg-red-100 text-red-600" :
                                    task.priority === 'medium' ? "bg-amber-100 text-amber-600" :
                                    "bg-emerald-100 text-emerald-600"
                                  )}>
                                    {task.priority === 'high' ? t.priorityHigh :
                                     task.priority === 'medium' ? t.priorityMedium :
                                     t.priorityLow}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between mt-3 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                      {t.progressLabel}
                                    </span>
                                    <span className={cn(
                                      "text-xs font-black tabular-nums",
                                      task.completed ? "text-emerald-500" : colors.text
                                    )}>
                                      {task.progress || 0}%
                                    </span>
                                  </div>
                                  <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden group/slider shadow-inner">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${task.progress || 0}%` }}
                                      className={cn(
                                        "absolute inset-y-0 left-0 rounded-full transition-colors duration-300",
                                        task.completed ? "bg-emerald-500" : colors.marker
                                      )}
                                    >
                                      <div className="absolute top-0 right-0 h-full w-4 bg-white/20 blur-sm" />
                                    </motion.div>
                                    <input 
                                      type="range"
                                      min="0"
                                      max="100"
                                      step="5"
                                      value={task.progress || 0}
                                      onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {/* Visual Cue for interaction */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none">
                                      <div className="text-[8px] font-black uppercase text-white drop-shadow-sm">
                                        {t.dragToAdjust}
                                      </div>
                                    </div>
                                  </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all w-fit",
                                    task.reminderTime ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-slate-50 border-slate-100 text-slate-400"
                                  )}>
                                    <Bell className={cn("w-3.5 h-3.5", task.reminderTime ? "animate-pulse" : "")} />
                                    <input 
                                      type="datetime-local" 
                                      value={task.reminderTime ? new Date(task.reminderTime).toISOString().slice(0, 16) : ''}
                                      onChange={(e) => setTaskReminder(task.id, e.target.value)}
                                      className="bg-transparent border-none outline-none text-[10px] font-black tracking-tight cursor-pointer"
                                    />
                                  </div>
                                  {task.reminderTime && (
                                    <button 
                                      onClick={() => setTaskReminder(task.id, '')}
                                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => setTaskToDelete(task)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  }) : (
                    <div className="text-center py-16 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                      <div className="bg-white w-16 h-16 rounded-3xl flex items-center justify-center mb-4 mx-auto shadow-sm">
                        <CheckCircle2 className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold tracking-tight">
                        {t.noTasksToday}
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* 4. Section "Progression" */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{t.progressLabel}</h3>
                <p className="text-slate-400 font-medium text-sm mt-1">{t.overviewBySubject}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={resetProgress}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title={t.resetTitle}
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <div className="bg-primary-50 px-4 py-2 rounded-xl">
                  <span className="text-primary-600 font-black text-lg">{overallProgress}%</span>
                </div>
              </div>
            </div>
            
            <div className="w-full">
               <SubjectRaceChart data={chartData} lang={lang} />
            </div>

            {/* Subject Status List */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex items-center gap-2 mb-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t.subjectStatus}
                </h4>
              </div>
              {chartData.map((s, idx) => {
                const colors = getSubjectColor(s.fullName);
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "group p-5 rounded-[32px] border transition-all flex items-center justify-between",
                      s.isFinished 
                        ? "bg-emerald-50 border-emerald-100 shadow-sm" 
                        : "bg-white border-slate-100 hover:border-primary-100 hover:shadow-md"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-3 h-12 rounded-full", colors.marker)} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-900 leading-tight">{s.fullName}</p>
                          {s.isFinished && (
                            <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                              {t.completedBadge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className={cn("w-3 h-3", s.completedTasks === s.totalTasks && s.totalTasks > 0 ? "text-emerald-500" : "text-slate-300")} />
                            <span className="text-[10px] font-bold text-slate-500">
                              {s.completedTasks}/{s.totalTasks} {t.tasks}
                            </span>
                          </div>
                          {s.hasGoals && (
                            <div className="flex items-center gap-1">
                              <Target className={cn("w-3 h-3", s.goalsCompleted ? "text-primary-500" : "text-slate-300")} />
                              <span className="text-[10px] font-bold text-slate-500">
                                {t.goals}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={cn("text-lg font-black leading-none", s.isFinished ? "text-emerald-600" : "text-slate-400")}>
                          {s.progress}%
                        </p>
                      </div>
                      {s.isFinished && (
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Section 4b: Objectifs d'étude (Study Goals) */}
            <div className="mt-12 space-y-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-50 p-2 rounded-xl text-primary-600">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t.studyGoalsHeader}
                  </h4>
                </div>
                {studyGoals.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-400">
                    {studyGoals.filter(g => g.currentValue >= g.targetValue).length}/{studyGoals.length} {t.reachedGoals}
                  </span>
                )}
              </div>

              {studyGoals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studyGoals.map((goal, idx) => {
                    const isReached = goal.currentValue >= goal.targetValue;
                    const progressVal = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);

                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                          "p-5 rounded-[32px] border transition-all relative overflow-hidden group",
                          isReached 
                            ? "bg-emerald-50 border-emerald-100 shadow-sm" 
                            : "bg-white border-slate-100 hover:border-primary-100 hover:shadow-md"
                        )}
                      >
                        {/* Status marker */}
                        <div className={cn(
                          "absolute top-0 left-0 bottom-0 w-1",
                          isReached ? "bg-emerald-500" : "bg-primary-500"
                        )} />

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                               "p-2 rounded-xl",
                               isReached ? "bg-emerald-100 text-emerald-600" : "bg-slate-50 text-slate-400"
                             )}>
                               <Award className="w-4 h-4" />
                             </div>
                             <div>
                               <p className="font-black text-slate-900 leading-tight text-sm line-clamp-1 group-hover:text-primary-600 transition-colors">
                                 {goal.title}
                               </p>
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                 {goal.subject || t.generalSubject}
                               </span>
                             </div>
                          </div>
                          {isReached && (
                            <div className="bg-emerald-500 text-white p-1 rounded-lg">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-0.5">
                            <span className="text-[11px] font-black text-slate-800">
                              {progressVal}%
                            </span>
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              isReached ? "text-emerald-500" : "text-slate-400"
                            )}>
                              {goal.currentValue} / {goal.targetValue} {goal.unit}
                            </span>
                          </div>
                          
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressVal}%` }}
                              className={cn(
                                "h-full rounded-full",
                                isReached ? "bg-emerald-500" : "bg-primary-500"
                              )}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                   <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 opacity-60">
                     <img 
                      src="/logo.png" 
                      alt="Bac Tracker Logo" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                        e.currentTarget.parentElement?.classList.add('bg-white', 'shadow-sm');
                      }}
                     />
                     <Target className="w-6 h-6 text-slate-200 hidden fallback-icon" />
                   </div>
                  <p className="text-slate-400 font-bold italic text-sm">
                    {t.noGoals}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-200">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              {t.quickAccess}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => onTabChange?.('resources')}
                className="flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-3xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary-500 p-3 rounded-2xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="font-bold">{t.summarizeLesson}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => onTabChange?.('chatbot')}
                className="flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-3xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500 p-3 rounded-2xl">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="font-bold">{t.createQuiz}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => onTabChange?.('calendar')}
                className="flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-3xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500 p-3 rounded-2xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="font-bold">{t.viewSchedule}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 6. Section "Planning rapide" (Tomorrow) */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary-600" />
              {t.planTomorrow}
            </h3>
            <div className="space-y-4">
              {tomorrowTasks.length > 0 ? tomorrowTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-2 h-12 bg-primary-200 rounded-full" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{task.title}</p>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.subject}</p>
                      <span className="text-[10px] font-bold text-primary-600">{task.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm font-medium italic">{t.nothingPlannedTomorrow}</p>
                </div>
              )}
            </div>
          </div>

          {/* 7. Section "Mémoire / Activités" */}
          <ActivityMemory userProfile={userProfile} lang={lang} />

          {/* New Section: Study Time graph */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">{t.timeStats}</h3>
                <p className="text-slate-500 font-medium text-xs mt-1">
                  {t.weeklyStudyRate}
                </p>
              </div>
              <div className="bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-primary-600 font-black text-sm">
                  {Math.floor(studyTimeData.reduce((acc, curr) => acc + curr.minutes, 0) / 60)}h {studyTimeData.reduce((acc, curr) => acc + curr.minutes, 0) % 60}m
                </span>
              </div>
            </div>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studyTimeData}>
                  <defs>
                    <linearGradient id="colorStudyTime2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10 }} 
                    hide
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any, name: any, props: any) => [props.payload.displayTime, t.study]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorStudyTime2)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Existing components maintained for functionality */}
      <StudyGoals 
        userProfile={userProfile} 
        subjects={subjects} 
        onXPEarned={async (xp) => {
          const milestone = await checkXPProgression(userProfile, (userProfile.points || 0) + xp);
          setRewardModal({
            isOpen: true,
            xpEarned: xp,
            milestone: milestone || undefined
          });
        }}
      />

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {taskToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {t.deleteTitle}
              </h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                {t.deleteConfirmMsg(taskToDelete.title)}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setTaskToDelete(null)}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                >
                  {t.delete}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnalyticsSummary: React.FC<{ neglected: any[], weak: string[], lang: Language, onViewAnalytics: () => void }> = ({ neglected, weak, lang, onViewAnalytics }) => {
  const t = tDict[lang] || tDict.fr;
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 md:gap-3">
          <div className="bg-red-50 p-2 rounded-xl">
            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
          </div>
          {t.focusTitle}
        </h3>
        <button 
          onClick={onViewAnalytics}
          className="text-[9px] md:text-[10px] font-black text-primary-600 bg-primary-50 px-2.5 md:px-3 py-1.5 rounded-lg md:rounded-xl uppercase tracking-widest hover:bg-primary-100 transition-all shadow-sm"
        >
          {t.details}
        </button>
      </div>

      <div className="space-y-4 md:space-y-6 flex-1 flex flex-col justify-center">
        {neglected.length > 0 && (
          <div>
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3 px-1">
              {t.neglectedSubjects}
            </p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {neglected.map(s => (
                <div key={s.name} className="flex items-center gap-1.5 md:gap-2 bg-red-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-red-100">
                  <span className="text-[10px] md:text-[11px] font-bold text-red-700 whitespace-nowrap">{s.name}</span>
                  <span className="text-[8px] md:text-[9px] font-black text-red-400">{s.days}j</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {weak.length > 0 && (
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
              {t.weakSubjects}
            </p>
            <div className="flex flex-wrap gap-2">
              {weak.map(s => (
                <div key={s} className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                  <span className="text-[11px] font-bold text-amber-700">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {neglected.length === 0 && weak.length === 0 && (
          <div className="py-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-100">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-sm text-slate-500 font-bold mb-1">
              {t.allUnderControl} ✨
            </p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{t.performanceOptimized}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PomodoroModule: React.FC<{ 
  userProfile: UserProfile, 
  onStreakUpdate: () => void, 
  onXPEarned?: (xp: number) => void,
  setIsManualActive?: (isActive: boolean) => void,
  subjects?: string[]
}> = ({ userProfile, onStreakUpdate, onXPEarned, setIsManualActive, subjects = [] }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(1500);
  const [initialSeconds, setInitialSeconds] = useState(1500);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const lang: Language = userProfile.language || 'fr';
  const t = tDict[lang] || tDict.fr;

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      handleComplete();
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const handleComplete = async () => {
    setIsActive(false);
    setIsManualActive?.(false);
    
    if (mode === 'work') {
      const timeStudied = initialSeconds - seconds;
      const pointsEarned = Math.floor(timeStudied / 60) * 2 + 10;
      const today = new Date().toISOString().split('T')[0];
      
      const updates: any = {
        points: (userProfile.points || 0) + pointsEarned
      };

      const newStreak = await updateStreak(userProfile);
      updates.currentStreak = newStreak;
      updates.lastActivityDate = today;
      if (newStreak > userProfile.currentStreak) {
        onStreakUpdate();
      }

      await updateDoc(doc(db, 'users', userProfile.email), updates);
      
      // Award "focused" badge for first session
      await checkBadges(userProfile, { action: 'session_finished' });
      
      await addDoc(collection(db, 'studySessions'), {
        uid: userProfile.uid,
        duration: timeStudied,
        date: today,
        subjectId: selectedSubject || 'Général',
        createdAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'activityLog'), {
        uid: userProfile.uid,
        type: 'study_session',
        title: `Session Pomodoro : ${Math.floor(timeStudied / 60)} min`,
        subject: selectedSubject || 'Général',
        timestamp: new Date().toISOString(),
        date: today,
        xpEarned: pointsEarned + (userProfile.lastActivityDate !== today ? 50 : 0)
      });

      if (onXPEarned) {
        onXPEarned(pointsEarned + (userProfile.lastActivityDate !== today ? 50 : 0));
      }
    }

    // Reset timer
    const times = { work: 1500, short: 300, long: 900 };
    setSeconds(times[mode]);
  };

  const setTimerMode = (m: 'work' | 'short' | 'long') => {
    setMode(m);
    setIsActive(false);
    setIsManualActive?.(false);
    const times = { work: 1500, short: 300, long: 900 };
    setSeconds(times[m]);
    setInitialSeconds(times[m]);
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
       <div className="flex gap-1.5 mb-8 bg-slate-50 p-1 rounded-2xl w-full">
          {[
            { id: 'work', label: t.focus, icon: Timer },
            { id: 'short', label: t.pause, icon: Coffee }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setTimerMode(m.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                mode === m.id ? "bg-white text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <m.icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          ))}
       </div>

       {mode === 'work' && subjects.length > 0 && !isActive && (
         <div className="w-full space-y-2 mb-6">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 block">
             {t.chooseSubject}
           </label>
           <select
             value={selectedSubject}
             onChange={(e) => setSelectedSubject(e.target.value)}
             className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary-100 transition-all appearance-none cursor-pointer"
           >
             <option value="">{t.generalSubject}</option>
             {subjects.map(s => (
               <option key={s} value={s}>{s}</option>
             ))}
           </select>
         </div>
       )}

       <div className="text-6xl font-black text-slate-800 mb-8 font-mono tabular-nums tracking-tighter">
         {formatTime(seconds)}
       </div>

       <div className="flex gap-3 w-full">
         <button
           onClick={() => {
             const newActive = !isActive;
             setIsActive(newActive);
             setIsManualActive?.(newActive);
           }}
           className={cn(
             "h-14 flex-1 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg",
             isActive ? "bg-red-500 text-white shadow-red-100" : "bg-primary-600 text-white shadow-primary-100 active:scale-95"
           )}
         >
           {isActive ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current text-white" />}
            {isActive 
              ? t.stopSession
              : t.startSession
            }
         </button>
         <button
           onClick={() => {
             setIsActive(false);
             setIsManualActive?.(false);
             setSeconds(initialSeconds);
           }}
           className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center"
         >
           <RotateCcw className="w-5 h-5 font-black" />
         </button>
       </div>
    </div>
  );
};

const ActivityMemory: React.FC<{ userProfile: UserProfile, lang: Language }> = ({ userProfile, lang }) => {
  const t = tDict[lang] || tDict.fr;
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const path = 'activityLog';
    const q = query(
      collection(db, path), 
      where('uid', '==', userProfile.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  const today = new Date();
  const dateStr = today.toLocaleDateString(locale(lang), { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
          <History className="w-6 h-6 text-emerald-600" />
          {t.memoryOfToday}
        </h3>
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
          {dateStr}
        </span>
      </div>
      
      <div className="space-y-4">
        {logs.length > 0 ? logs.map(log => (
          <div key={log.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="bg-white p-2 rounded-xl shadow-sm mt-1">
              {log.type === 'task_completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-primary-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {log.type === 'task_completed' 
                  ? t.completedLog(log.title)
                  : log.title
                }
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.subject}</span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString(locale(lang), { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm font-medium italic">{t.noMemories}</p>
          </div>
        )}
      </div>
    </div>
  );
};
