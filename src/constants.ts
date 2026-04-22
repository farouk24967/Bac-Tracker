import { Stream } from './types';

export const STREAMS: Stream[] = [
  'علوم تجريبية',
  'رياضيات',
  'تقني رياضي',
  'تسيير واقتصاد',
  'آداب وفلسفة',
  'لغات أجنبية'
];

export const SUBJECTS_BY_STREAM: Record<string, string[]> = {
  'علوم تجريبية': ['العربية', 'الفرنسية', 'الإنجليزية', 'التربية الإسلامية', 'التاريخ والجغرافيا', 'الرياضيات', 'علوم الطبيعة والحياة', 'العلوم الفيزيائية', 'الفلسفة', 'التربية البدنية'],
  'رياضيات': ['العربية', 'الفرنسية', 'الإنجليزية', 'التربية الإسلامية', 'التاريخ والجغرافيا', 'الرياضيات', 'علوم الطبيعة والحياة', 'العلوم الفيزيائية', 'الفلسفة', 'التربية البدنية'],
  'تقني رياضي': ['العربية', 'الفرنسية', 'الإنجليزية', 'التربية الإسلامية', 'التاريخ والجغرافيا', 'الرياضيات', 'العلوم الفيزيائية', 'التكنولوجيا', 'الفلسفة', 'التربية البدنية'],
  'تسيير واقتصاد': ['العربية', 'الفرنسية', 'الإنجليزية', 'التربية الإسلامية', 'التاريخ والجغرافيا', 'الرياضيات', 'الاقتصاد والمناجمنت', 'القانون', 'التسيير المحاسبي والمالي', 'الفلسفة', 'التربية البدنية'],
  'لغات أجنبية': ['العربية', 'الفرنسية', 'الإنجليزية', 'اللغة الأجنبية الثالثة', 'التربية الإسلامية', 'التاريخ والجغرافيا', 'الرياضيات', 'الفلسفة', 'التربية البدنية'],
  'آداب وفلسفة': ['العربية', 'الفرنسية', 'الإنجليزية', 'التربية الإسلامية', 'التاريخ والجغرافيا', 'الرياضيات', 'الفلسفة', 'التربية البدنية']
};

export const AI_TOOLS: any[] = [
  {
    name: 'NotebookLM',
    description: 'Analyse tes documents et crée des guides d\'étude intelligents avec l\'IA de Google.',
    url: 'https://notebooklm.google.com',
    icon: 'BookOpen',
    logoUrl: 'https://www.gstatic.com/images/branding/product/1x/notebookllm_64dp.png',
    videoUrl: 'https://www.youtube.com/embed/5O6uApsmXfM',
    videoType: 'youtube',
    prompts: [
      {
        title: 'Résumé de document',
        text: 'Analyse ce document de cours et crée-moi un guide d\'étude avec les concepts clés et un quiz d\'entraînement.'
      },
      {
        title: 'Génération de FAQ',
        text: 'À partir de mon cours, génère une liste des questions les plus probables pour l\'examen.'
      }
    ]
  },
  {
    name: 'Wooflash',
    description: 'Crée des parcours d\'apprentissage personnalisés avec des micro-objectifs et la répétition espacée.',
    url: 'https://www.wooflash.com',
    icon: 'Zap',
    logoUrl: 'https://www.wooflash.com/wp-content/uploads/2021/07/wooflash-logo-header.png',
    videoUrl: 'https://www.youtube.com/embed/5dPO702CoRs',
    videoType: 'youtube',
    prompts: [
      {
        title: 'Génération de Quiz',
        text: 'Crée un quiz de 10 questions à choix multiples à partir de ce cours sur [Matière].'
      }
    ]
  },
  {
    name: 'ChatLLM',
    description: 'Accède aux meilleurs modèles d\'IA (Claude, GPT-4, Llama) pour t\'aider à comprendre tes cours.',
    url: 'https://abacus.ai/chatllm',
    icon: 'MessageSquare',
    videoUrl: 'https://www.youtube.com/embed/S2O6n9m2nZk',
    videoType: 'youtube',
    prompts: [
      {
        title: 'Explication complexe',
        text: 'Explique-moi le théorème de [Nom] comme si j\'avais 5 ans, puis donne-moi une application réelle pour le Bac.'
      }
    ]
  },
  {
    name: 'LearnKata',
    description: 'Transforme n\'importe quel support (vidéo, texte, PDF) en un cours interactif personnalisé avec quiz.',
    url: 'https://www.learnkata.ai',
    icon: 'Brain',
    videoUrl: 'https://www.youtube.com/embed/nshR6pLd_tU',
    videoType: 'youtube',
    prompts: [
      {
        title: 'Création de cours',
        text: 'Transforme ce chapitre sur [Sujet] en un parcours d\'apprentissage avec des questions de compréhension.'
      }
    ]
  },
  {
    name: 'Perplexity',
    description: 'Le moteur de recherche dopé à l\'IA pour trouver des sources fiables instantanément.',
    url: 'https://www.perplexity.ai',
    icon: 'Search',
    prompts: [
      {
        title: 'Vérification de concept',
        text: 'Explique-moi le concept de [Concept] dans le programme du Bac algérien avec des exemples concrets.'
      }
    ]
  }
];

export const COEFFICIENTS: Record<string, Record<string, number>> = {
  'علوم تجريبية': {
    'علوم الطبيعة والحياة': 6,
    'العلوم الفيزيائية': 5,
    'الرياضيات': 5,
    'العربية': 3,
    'الفلسفة': 2,
    'التاريخ والجغرافيا': 2,
    'الإنجليزية': 2,
    'الفرنسية': 2,
    'التربية الإسلامية': 2,
    'التربية البدنية': 1
  },
  'رياضيات': {
    'الرياضيات': 7,
    'العلوم الفيزيائية': 6,
    'علوم الطبيعة والحياة': 2,
    'العربية': 3,
    'الفلسفة': 2,
    'التاريخ والجغرافيا': 2,
    'الإنجليزية': 2,
    'الفرنسية': 2,
    'التربية الإسلامية': 2,
    'التربية البدنية': 1
  },
  'تقني رياضي': {
    'التكنولوجيا': 6,
    'الرياضيات': 6,
    'العلوم الفيزيائية': 6,
    'العربية': 3,
    'الفلسفة': 2,
    'التاريخ والجغرافيا': 2,
    'الإنجليزية': 2,
    'الفرنسية': 2,
    'التربية الإسلامية': 2,
    'التربية البدنية': 1
  },
  'تسيير واقتصاد': {
    'التسيير المحاسبي والمالي': 6,
    'الاقتصاد والمناجمنت': 6,
    'القانون': 6,
    'الرياضيات': 5,
    'العربية': 3,
    'التاريخ والجغرافيا': 4,
    'الفلسفة': 2,
    'الإنجليزية': 2,
    'الفرنسية': 2,
    'التربية الإسلامية': 2,
    'التربية البدنية': 1
  },
  'لغات أجنبية': {
    'اللغة الأجنبية الثالثة': 5,
    'العربية': 5,
    'الفرنسية': 3,
    'الإنجليزية': 3,
    'الفلسفة': 2,
    'التاريخ والجغرافيا': 2,
    'الرياضيات': 2,
    'التربية الإسلامية': 2,
    'التربية البدنية': 1
  },
  'آداب وفلسفة': {
    'الفلسفة': 6,
    'العربية': 6,
    'التاريخ والجغرافيا': 4,
    'اللغة الفرنسية': 3,
    'اللغة الإنجليزية': 3,
    'التربية الإسلامية': 2,
    'الرياضيات': 2,
    'التربية البدنية': 1
  }
};
