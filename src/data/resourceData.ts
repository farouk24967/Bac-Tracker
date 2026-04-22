export interface TeacherResource {
  id: string;
  name: string;
  subject: string;
  url: string;
  description: string;
  type: 'video' | 'pdf' | 'link';
}

export const TEACHER_RESOURCES: TeacherResource[] = [
  // Mathématiques
  {
    id: 'm1',
    name: 'Prof Nour Eddine',
    subject: 'الرياضيات',
    url: 'https://www.youtube.com/@noureddine2013',
    description: 'La référence incontournable pour les mathématiques en Algérie.',
    type: 'video'
  },
  {
    id: 'm2',
    name: 'Prof Abd El Bassit',
    subject: 'الرياضيات',
    url: 'https://www.youtube.com/@prof_abdelbassit9880',
    description: 'Cours détaillés et exercices corrigés pour tous les niveaux.',
    type: 'video'
  },
  {
    id: 'm3',
    name: 'Prof Walid Merniz',
    subject: 'الرياضيات',
    url: 'https://www.youtube.com/@WalidMerniz',
    description: 'Explications claires et méthodologie efficace.',
    type: 'video'
  },

  // Physique-Chimie
  {
    id: 'p1',
    name: 'Ahmed Trir',
    subject: 'العلوم الفيزيائية',
    url: 'https://www.youtube.com/@AhmedTrir',
    description: 'Excellent pour la physique et la chimie du Bac.',
    type: 'video'
  },
  {
    id: 'p2',
    name: 'الأستاذ عبد اللطيف',
    subject: 'العلوم الفيزيائية',
    url: 'https://www.youtube.com/@profabdellatif',
    description: 'Vidéos pédagogiques de haute qualité.',
    type: 'video'
  },
  {
    id: 'p3',
    name: 'Tayeb Abderrazak',
    subject: 'العلوم الفيزيائية',
    url: 'https://www.youtube.com/@tayeb_abderrazak',
    description: 'Spécialiste de la préparation au Baccalauréat.',
    type: 'video'
  },
  {
    id: 'p4',
    name: 'Aymen Physics',
    subject: 'العلوم الفيزيائية',
    url: 'https://www.youtube.com/@AymenPhysics',
    description: 'Cours dynamiques et résumés efficaces.',
    type: 'video'
  },

  // Sciences Naturelles (SVT)
  {
    id: 's1',
    name: 'Prof Ayoub',
    subject: 'علوم الطبيعة والحياة',
    url: 'https://www.youtube.com/@ProfAyoubSciences',
    description: 'Méthodologie et rigueur scientifique.',
    type: 'video'
  },
  {
    id: 's2',
    name: 'Rabie Yassine',
    subject: 'علوم الطبيعة والحياة',
    url: 'https://www.youtube.com/@YassineRabie',
    description: 'Explications approfondies du programme algérien.',
    type: 'video'
  },
  {
    id: 's3',
    name: 'Prof Katfi',
    subject: 'علوم الطبيعة والحياة',
    url: 'https://www.youtube.com/results?search_query=الأستاذ+كتفي+شريف+علوم',
    description: 'Haute recommandation pour les sciences naturelles.',
    type: 'video'
  },

  // Histoire-Géographie
  {
    id: 'hg1',
    name: 'Prof Guenchouba',
    subject: 'التاريخ والجغرافيا',
    url: 'https://www.youtube.com/@AmineGuenchouba',
    description: 'Le prof le plus populaire sur YouTube et TikTok.',
    type: 'video'
  },
  {
    id: 'hg2',
    name: 'Prof Bournan',
    subject: 'التاريخ والجغرافيا',
    url: 'https://www.youtube.com/@BournanHistoireGeo',
    description: 'Résumés et schémas pour mémoriser facilement.',
    type: 'video'
  },
  {
    id: 'hg3',
    name: 'Mohamed Larouk',
    subject: 'التاريخ والجغرافيا',
    url: 'https://www.youtube.com/@MohamedLarouk',
    description: 'Approche pédagogique moderne et complète.',
    type: 'video'
  },

  // Langue Arabe
  {
    id: 'ar1',
    name: 'Prof Haikoun',
    subject: 'العربية',
    url: 'https://www.youtube.com/@ProfHaikoun',
    description: 'Expert en langue et littérature arabes.',
    type: 'video'
  },
  {
    id: 'ar2',
    name: 'Khaled Hamache',
    subject: 'العربية',
    url: 'https://www.youtube.com/@KhaledHamache',
    description: 'Analyse de textes et points de grammaire essentiels.',
    type: 'video'
  },

  // Langue Française
  {
    id: 'fr1',
    name: 'Prof Sally',
    subject: 'الفرنسية',
    url: 'https://www.youtube.com/@ProfSally',
    description: 'Parfait pour maîtriser la langue française au Bac.',
    type: 'video'
  },
  {
    id: 'fr2',
    name: 'Prof Mansouri (Fr)',
    subject: 'الفرنسية',
    url: 'https://www.youtube.com/results?search_query=الأستاذ+منصوري+فرنسية',
    description: 'Méthodologie du compte-rendu et des textes.',
    type: 'video'
  },
  {
    id: 'fr3',
    name: 'Prof Melissa',
    subject: 'الفرنسية',
    url: 'https://www.youtube.com/@ProfMelissa',
    description: 'Cours simplifiés et conseils pratiques.',
    type: 'video'
  },
  {
    id: 'fr4',
    name: 'Reda Francais',
    subject: 'الفرنسية',
    url: 'https://www.youtube.com/@RedaFrancais',
    description: 'Révisions rapides et efficaces.',
    type: 'video'
  },

  // Langue Anglaise
  {
    id: 'en1',
    name: 'Prof Mansouri (En)',
    subject: 'الإنجليزية',
    url: 'https://www.youtube.com/results?search_query=الأستاذ+منصوري+انجليزية',
    description: 'Toutes les bases de l\'anglais pour le Bac.',
    type: 'video'
  },
  {
    id: 'en2',
    name: 'Amine English',
    subject: 'الإنجليزية',
    url: 'https://www.youtube.com/@AmineEnglish',
    description: 'Apprendre l\'anglais avec dynamisme.',
    type: 'video'
  },

  // Philosophie
  {
    id: 'ph1',
    name: 'Prof Adel Magroud',
    subject: 'الفلسفة',
    url: 'https://www.youtube.com/@ProfAdelMagroud',
    description: 'Décortique les sujets de philosophie avec brio.',
    type: 'video'
  },
  {
    id: 'ph2',
    name: 'Houari',
    subject: 'الفلسفة',
    url: 'https://www.youtube.com/@HouariPhilosophie',
    description: 'Méthodologie et analyse des citations.',
    type: 'video'
  },
  {
    id: 'ph3',
    name: 'Khalil Saidani',
    subject: 'الفلسفة',
    url: 'https://www.youtube.com/@KhalilSaidani',
    description: 'Comprendre la philo sans l\'apprendre par cœur.',
    type: 'video'
  },

  // Gestion et Économie
  {
    id: 'ge1',
    name: 'Chaînes Spécialisées Gestion',
    subject: 'التسيير المحاسبي والمالي',
    url: 'https://www.youtube.com/results?search_query=التسيير+و+الاقتصاد+الجزائر',
    description: 'Toutes les ressources pour la filière Gestion et Économie.',
    type: 'video'
  },
  {
    id: 'ge2',
    name: 'Econodz',
    subject: 'الاقتصاد والمناجمنت',
    url: 'https://www.youtube.com/results?search_query=الاقتصاد+والمناجمنت+بكالوريا+الجزائر',
    description: 'Cours complets d\'économie.',
    type: 'video'
  }
];
