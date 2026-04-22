import { Language } from '../types';

export interface Milestone {
  id: string;
  xp: number;
  title: Record<Language, string>;
  message: Record<Language, string>;
}

export const XP_MILESTONES: Milestone[] = [
  {
    id: 'novice',
    xp: 0,
    title: { fr: 'Bachelier Novice', en: 'Bac Novice', ar: 'مبتدئ البكالوريا', es: 'Bachiller Novato' },
    message: { fr: 'Bienvenue dans ton aventure vers la réussite !', en: 'Welcome to your adventure towards success!', ar: 'مرحباً بك في مغامرتك نحو النجاح!', es: '¡Bienvenido a tu aventura hacia el éxito!' }
  },
  {
    id: 'student_engaged',
    xp: 100,
    title: { fr: 'Élève Engagé', en: 'Engaged Student', ar: 'طالب ملتزم', es: 'Estudiante Comprometido' },
    message: { fr: 'Bravo ! Tu prends tes études au sérieux.', en: 'Bravo! You are taking your studies seriously.', ar: 'برافو! أنت تأخذ دراستك على محمل الجد.', es: '¡Bravo! Te tomas tus estudios en serio.' }
  },
  {
    id: 'study_expert',
    xp: 500,
    title: { fr: 'Expert de la Révision', en: 'Study Expert', ar: 'خبير المراجعة', es: 'Experto en Repaso' },
    message: { fr: 'Incroyable ! Ta rigueur est impressionnante.', en: 'Incredible! Your rigor is impressive.', ar: 'مذهل! صرامتك مثيرة للإعجاب.', es: '¡Increíble! Tu rigor es impresionante.' }
  },
  {
    id: 'scholar_king',
    xp: 1000,
    title: { fr: 'Roi du Savoir', en: 'Scholar King', ar: 'ملك المعرفة', es: 'Rey del Conocimiento' },
    message: { fr: 'Un véritable leader ! Le Bac n\'a plus de secrets pour toi.', en: 'A true leader! The Bac has no more secrets for you.', ar: 'قائد حقيقي! البكالوريا لم تعد تخفي عنك أسراراً.', es: '¡Un verdadero líder! El Bachillerato ya no tiene secretos para ti.' }
  },
  {
    id: 'bac_legend',
    xp: 2500,
    title: { fr: 'Légende du Bac', en: 'Bac Legend', ar: 'أسطورة البكالوريا', es: 'Leyenda del Bachillerato' },
    message: { fr: 'Tu es une légende ! Ton destin est tracé vers l\'excellence.', en: 'You are a legend! Your destiny is set for excellence.', ar: 'أنت أسطورة! قدرك مرسوم نحو التميز.', es: '¡Eres una leyenda! Tu destino está trazado hacia la excelencia.' }
  },
  {
    id: 'invincible',
    xp: 5000,
    title: { fr: 'L\'Invincible', en: 'The Invincible', ar: 'لا يقهر', es: 'El Invencible' },
    message: { fr: 'Plus rien ne peut t\'arrêter. Le succès est inévitable !', en: 'Nothing can stop you anymore. Success is inevitable!', ar: 'لا شيء يمكنه إيقافك بعد الآن. النجاح حتمي!', es: '¡Nada puede detenerte ya. ¡El éxito es inevitable!' }
  }
];

export const getTitleForXP = (xp: number, lang: Language = 'fr'): string => {
  const milestone = [...XP_MILESTONES].reverse().find(m => xp >= m.xp);
  return milestone ? milestone.title[lang] : XP_MILESTONES[0].title[lang];
};

export const getNextMilestone = (xp: number) => {
  return XP_MILESTONES.find(m => xp < m.xp);
};
