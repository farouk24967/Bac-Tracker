import { Stream } from './types';
import {
  getStreamSubjects,
  getStreamCoefficients,
  DEFAULT_BAC_YEAR,
} from './lib/bacConfig';

export const STREAMS: Stream[] = [
  'علوم تجريبية',
  'رياضيات',
  'تقني رياضي',
  'تسيير واقتصاد',
  'آداب وفلسفة',
  'لغات أجنبية'
];

// Matières actives pour la session BAC courante (source unique de vérité
// définie dans lib/bacConfig.ts). Une seule source pour éviter les doublons
// entre le dashboard, les statistiques et le calculateur.
export const SUBJECTS_BY_STREAM: Record<string, string[]> = Object.fromEntries(
  STREAMS.map(s => [s, getStreamSubjects(DEFAULT_BAC_YEAR, s)])
);

export const COEFFICIENTS: Record<string, Record<string, number>> = Object.fromEntries(
  STREAMS.map(s => [s, getStreamCoefficients(DEFAULT_BAC_YEAR, s)])
);

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

