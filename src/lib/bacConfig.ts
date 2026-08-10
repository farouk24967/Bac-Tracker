import { Stream } from '../types';

export interface SubjectConfig {
  name: string;
  coef: number;
  optional?: boolean;
}

export type StreamSubjects = Record<Stream, SubjectConfig[]>;

// =============================================================
// SOURCE DE VÉRITÉ — Configuration BAC 2027
// Chaque session possède sa propre configuration indépendante
// (matières + coefficients) stockée ici côté client et
// synchronisée dans `bac_subject_configs` (Firestore) pour
// vérification côté serveur.
// =============================================================

export const BAC_2027_CONFIG: StreamSubjects = {
  'علوم تجريبية': [
    { name: 'الرياضيات', coef: 5 },
    { name: 'علوم الطبيعة والحياة', coef: 6 },
    { name: 'العلوم الفيزيائية', coef: 4 },
    { name: 'العربية', coef: 2 },
    { name: 'الإنجليزية', coef: 3 },
    { name: 'التربية الإسلامية', coef: 2 },
    { name: 'التاريخ', coef: 2 },
    { name: 'التربية البدنية', coef: 2, optional: true },
  ],
  'رياضيات': [
    { name: 'الرياضيات', coef: 8 },
    { name: 'العلوم الفيزيائية', coef: 6 },
    { name: 'الإعلام الآلي', coef: 3 },
    { name: 'الإنجليزية', coef: 3 },
    { name: 'علوم الطبيعة والحياة', coef: 2 },
    { name: 'التربية الإسلامية', coef: 2 },
    { name: 'التاريخ', coef: 2 },
    { name: 'التربية البدنية', coef: 2, optional: true },
  ],
  'تقني رياضي': [
    { name: 'التكنولوجيا', coef: 7 },
    { name: 'الرياضيات', coef: 6 },
    { name: 'العلوم الفيزيائية', coef: 4 },
    { name: 'الإعلام الآلي', coef: 3 },
    { name: 'الإنجليزية', coef: 3 },
    { name: 'التربية الإسلامية', coef: 2 },
    { name: 'التاريخ', coef: 2 },
    { name: 'التربية البدنية', coef: 2, optional: true },
  ],
  'تسيير واقتصاد': [
    { name: 'المحاسبة', coef: 6 },
    { name: 'الاقتصاد', coef: 5 },
    { name: 'الرياضيات', coef: 5 },
    { name: 'التاريخ', coef: 4 },
    { name: 'العربية', coef: 2 },
    { name: 'الإنجليزية', coef: 3 },
    { name: 'القانون', coef: 2 },
    { name: 'التربية الإسلامية', coef: 2 },
    { name: 'الجغرافيا', coef: 2 },
    { name: 'التربية البدنية', coef: 2, optional: true },
  ],
  'آداب وفلسفة': [
    { name: 'العربية', coef: 6 },
    { name: 'الفلسفة', coef: 6 },
    { name: 'التاريخ', coef: 4 },
    { name: 'الفرنسية', coef: 3 },
    { name: 'الإنجليزية', coef: 3 },
    { name: 'التربية الإسلامية', coef: 2 },
    { name: 'الجغرافيا', coef: 2 },
    { name: 'التربية البدنية', coef: 2, optional: true },
  ],
  'لغات أجنبية': [
    { name: 'العربية', coef: 2 },
    { name: 'الفرنسية', coef: 5 },
    { name: 'الإنجليزية', coef: 5 },
    { name: 'اللغة الأجنبية الثالثة', coef: 6 },
    { name: 'التاريخ', coef: 3 },
    { name: 'الجغرافيا', coef: 2 },
    { name: 'التربية الإسلامية', coef: 2 },
    { name: 'التربية البدنية', coef: 2, optional: true },
  ],
};

export const DEFAULT_BAC_YEAR = 2027;

// Les sessions futures sans configuration officielle vérifiée
// réutilisent la dernière configuration connue comme base,
// jusqu'à ce qu'un administrateur la remplace dans la base.
export const SESSION_CONFIGS: Record<number, StreamSubjects> = {
  [DEFAULT_BAC_YEAR]: BAC_2027_CONFIG,
};

export function getSessionConfig(year: number): StreamSubjects {
  return SESSION_CONFIGS[year] || SESSION_CONFIGS[DEFAULT_BAC_YEAR];
}

export function getStreamSubjects(year: number, stream: Stream): string[] {
  return (getSessionConfig(year)[stream] || []).map(s => s.name);
}

export function getStreamCoefficients(year: number, stream: Stream): Record<string, number> {
  const result: Record<string, number> = {};
  (getSessionConfig(year)[stream] || []).forEach(s => {
    result[s.name] = s.coef;
  });
  return result;
}

export function getStreamSubjectsWithCoefficients(year: number, stream: Stream): SubjectConfig[] {
  return getSessionConfig(year)[stream] || [];
}
