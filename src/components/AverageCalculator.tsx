import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  BookOpen, 
  GraduationCap, 
  ChevronRight, 
  RotateCcw, 
  Save,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Language, Stream } from '../types';
import { STREAMS } from '../constants';
import { getStreamSubjectsWithCoefficients, DEFAULT_BAC_YEAR, SubjectConfig } from '../lib/bacConfig';

type SubjectInfo = SubjectConfig;

// Configuration BAC + Année scolaire : une seule source de vérité
// (lib/bacConfig.ts) — les coefficients sont spécifiques à la session.
const BAC_COEFFICIENTS: Record<string, SubjectInfo[]> = Object.fromEntries(
  STREAMS.map(s => [s, getStreamSubjectsWithCoefficients(DEFAULT_BAC_YEAR, s)])
);

// Aliases for French names
const STREAM_ALIASES: Record<string, string> = {
  "Sciences Expérimentales": "علوم تجريبية",
  "Mathématiques": "رياضيات",
  "Technique Mathématique": "تقني رياضي",
  "Gestion et Économie": "تسيير واقتصاد",
  "Langues Étrangères": "لغات أجنبية",
  "Lettres et Philosophie": "آداب وفلسفة",
  "Sciences": "علوم تجريبية",
  "Math": "رياضيات",
  "TM": "تقني رياضي",
  "GE": "تسيير واقتصاد"
};

// Les coefficients annuels (3AS) utilisent la même source que le BAC
// pour garantir un calcul identique en ligne et hors ligne.
const YEARLY_COEFFICIENTS: Record<string, SubjectInfo[]> = BAC_COEFFICIENTS;

interface AverageCalculatorProps {
  userProfile: any;
}

export const AverageCalculator: React.FC<AverageCalculatorProps> = ({ userProfile }) => {
  const [mode, setMode] = useState<'bac' | 'yearly'>('bac');
  const [stream, setStream] = useState<Stream>(userProfile.stream || STREAMS[0]);
  const [grades, setGrades] = useState<Record<string, { f?: number, cc?: number, tp?: number, exam?: number, average?: number, included: boolean }>>({});
  const [result, setResult] = useState<number | null>(null);
  const lang: Language = userProfile.language || 'fr';
  const tDict = {
    fr: {
      average_calculator: 'Calculateur de Moyenne',
      average_calculator_desc: "Calcule ta moyenne pour le Bac ou l'année scolaire (3AS).",
      baccalaureate: 'Baccalauréat',
      school_year: 'Année Scolaire',
      enter_grades: 'Saisie des notes',
      choose_correct_stream: 'Veuillez choisir la bonne filière',
      calculate_average: 'Calculer la moyenne',
      reset: 'Réinitialiser',
      result: 'Résultat',
      passed: 'Admis',
      failed: 'Ajourné',
      enter_notes_to_calc: 'Saisis tes notes',
      information: 'Informations',
      bac_formula_desc: "La moyenne du Bac est calculée en multipliant la moyenne de chaque matière par son coefficient.",
      yearly_formula_desc: 'Formule de calcul : (CC + TP + F + Exam × 2) / 5.',
      choose_stream_warning: 'Assure-toi de choisir la bonne filière avant de commencer la saisie.'
    },
    en: {
      average_calculator: 'Average Calculator',
      average_calculator_desc: 'Calculate your average for the Bac or the school year (3AS).',
      baccalaureate: 'Baccalaureate',
      school_year: 'School Year',
      enter_grades: 'Enter Grades',
      choose_correct_stream: 'Please choose the correct stream',
      calculate_average: 'Calculate the average',
      reset: 'Reset',
      result: 'Result',
      passed: 'Passed',
      failed: 'Failed',
      enter_notes_to_calc: 'Enter your grades',
      information: 'Information',
      bac_formula_desc: "The Bac average is calculated by multiplying each subject's average by its coefficient.",
      yearly_formula_desc: 'Calculation formula: (CC + TP + F + Exam × 2) / 5.',
      choose_stream_warning: 'Make sure you choose the correct stream before entering grades.'
    },
    es: {
      average_calculator: 'Calculadora de media',
      average_calculator_desc: 'Calcula tu media para el Bac o para el año escolar (3AS).',
      baccalaureate: 'Bachillerato',
      school_year: 'Año Escolar',
      enter_grades: 'Ingreso de notas',
      choose_correct_stream: 'Por favor elige la especialidad correcta',
      calculate_average: 'Calcular la media',
      reset: 'Restablecer',
      result: 'Resultado',
      passed: 'Aprobado',
      failed: 'Suspendido',
      enter_notes_to_calc: 'Ingresa tus notas',
      information: 'Información',
      bac_formula_desc: 'La media del Bac se calcula multiplicando la media de cada materia por su coeficiente.',
      yearly_formula_desc: 'Fórmula de cálculo: (CC + TP + F + Exam × 2) / 5.',
      choose_stream_warning: 'Asegúrate de elegir la especialidad correcta antes de comenzar a ingresar notas.'
    },
    ar: {
      average_calculator: 'حاسبة المعدل',
      average_calculator_desc: 'احسب معدلك للبكالوريا أو للسنة الدراسية (3 ثانوي).',
      baccalaureate: 'البكالوريا',
      school_year: 'السنة الدراسية',
      enter_grades: 'إدخال العلامات',
      choose_correct_stream: 'يرجى اختيار الشعبة الصحيحة',
      calculate_average: 'احسب المعدل',
      reset: 'مسح',
      result: 'النتيجة',
      passed: 'ناجح',
      failed: 'راسب',
      enter_notes_to_calc: 'أدخل العلامات للحساب',
      information: 'معلومات',
      bac_formula_desc: 'يتم حساب معدل البكالوريا بضرب معدل كل مادة في معاملها وقسمة المجموع على مجموع المعاملات.',
      yearly_formula_desc: 'صيغة حساب معدل المادة: (التقويم + الأعمال + الفرض + الاختبار × 2) / 5.',
      choose_stream_warning: 'تأكد من اختيار الشعبة الصحيحة قبل البدء في إدخال العلامات.'
    }
  };
  const t = tDict[lang] || tDict.fr;

  const streamKey = STREAM_ALIASES[stream] || stream;
  const currentSubjects = (mode === 'bac' ? BAC_COEFFICIENTS[streamKey] : YEARLY_COEFFICIENTS[streamKey]) || [];

  useEffect(() => {
    // Initialize grades when stream or mode changes
    const initialGrades: any = {};
    if (currentSubjects && currentSubjects.length > 0) {
      currentSubjects.forEach(s => {
        initialGrades[s.name] = { included: true };
      });
    }
    setGrades(initialGrades);
    setResult(null);
  }, [stream, mode, currentSubjects]);

  const handleGradeChange = (subject: string, field: string, value: string) => {
    const numValue = value === '' ? undefined : Math.min(20, Math.max(0, parseFloat(value)));
    setGrades(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: numValue
      }
    }));
  };

  const toggleIncluded = (subject: string) => {
    setGrades(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        included: !prev[subject].included
      }
    }));
  };

  const calculateAverage = () => {
    let totalPoints = 0;
    let totalCoef = 0;

    currentSubjects.forEach(s => {
      const g = grades[s.name];
      if (!g || !g.included) return;

      let subjectAverage = 0;
      if (mode === 'bac') {
        subjectAverage = g.average || 0;
      } else {
        const f = g.f || 0;
        const cc = g.cc || 0;
        const tp = g.tp || 0;
        const exam = g.exam || 0;
        // Formula from provided HTML: (cc + tp + f + exam * 2) / 5
        subjectAverage = (cc + tp + f + exam * 2) / 5;
      }

      totalPoints += subjectAverage * s.coef;
      totalCoef += s.coef;
    });

    if (totalCoef > 0) {
      setResult(totalPoints / totalCoef);
    }
  };

  const reset = () => {
    const initialGrades: any = {};
    if (currentSubjects && currentSubjects.length > 0) {
      currentSubjects.forEach(s => {
        initialGrades[s.name] = { included: true };
      });
    }
    setGrades(initialGrades);
    setResult(null);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            {t.average_calculator}
          </h2>
          <p className="text-slate-500 mt-1">
            {t.average_calculator_desc}
          </p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setMode('bac')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              mode === 'bac' ? "bg-primary-600 text-white shadow-lg shadow-primary-100" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            {t.baccalaureate}
          </button>
          <button 
            onClick={() => setMode('yearly')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              mode === 'yearly' ? "bg-primary-600 text-white shadow-lg shadow-primary-100" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            {t.school_year}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-primary-50 p-2 rounded-xl">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {t.enter_grades}
                </h3>
              </div>
              <select 
                value={stream}
                onChange={(e) => setStream(e.target.value as Stream)}
                className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary-500"
                dir="rtl"
              >
                {STREAMS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right" dir="rtl">
                <thead>
                  <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-50">
                    <th className="pb-4 pr-4 text-right">المادة</th>
                    <th className="pb-4 text-center">المعامل</th>
                    {mode === 'bac' ? (
                      <th className="pb-4 text-center">المعدل (0-20)</th>
                    ) : (
                      <>
                        <th className="pb-4 text-center">الفرض</th>
                        <th className="pb-4 text-center">تقويم</th>
                        <th className="pb-4 text-center">أعمال</th>
                        <th className="pb-4 text-center">اختبار</th>
                      </>
                    )}
                    <th className="pb-4 text-center">شامل؟</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentSubjects.length > 0 ? currentSubjects.map((s) => (
                    <tr key={s.name} className={cn(
                      "group transition-colors",
                      !grades[s.name]?.included && "opacity-40"
                    )}>
                      <td className="py-4 pr-4 font-bold text-slate-700">{s.name}</td>
                      <td className="py-4 text-center font-mono text-slate-400">{s.coef}</td>
                      {mode === 'bac' ? (
                        <td className="py-4 text-center">
                          <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            max="20"
                            value={grades[s.name]?.average ?? ''}
                            onChange={(e) => handleGradeChange(s.name, 'average', e.target.value)}
                            placeholder="0.00"
                            className="w-20 bg-slate-50 border-none rounded-lg px-2 py-1.5 text-center font-bold text-primary-600 outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </td>
                      ) : (
                        <>
                          <td className="py-4 text-center">
                            <input 
                              type="number" step="0.01" min="0" max="20"
                              value={grades[s.name]?.f ?? ''}
                              onChange={(e) => handleGradeChange(s.name, 'f', e.target.value)}
                              className="w-16 bg-slate-50 border-none rounded-lg px-2 py-1.5 text-center font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </td>
                          <td className="py-4 text-center">
                            <input 
                              type="number" step="0.01" min="0" max="20"
                              value={grades[s.name]?.cc ?? ''}
                              onChange={(e) => handleGradeChange(s.name, 'cc', e.target.value)}
                              className="w-16 bg-slate-50 border-none rounded-lg px-2 py-1.5 text-center font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </td>
                          <td className="py-4 text-center">
                            <input 
                              type="number" step="0.01" min="0" max="20"
                              value={grades[s.name]?.tp ?? ''}
                              onChange={(e) => handleGradeChange(s.name, 'tp', e.target.value)}
                              className="w-16 bg-slate-50 border-none rounded-lg px-2 py-1.5 text-center font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </td>
                          <td className="py-4 text-center">
                            <input 
                              type="number" step="0.01" min="0" max="20"
                              value={grades[s.name]?.exam ?? ''}
                              onChange={(e) => handleGradeChange(s.name, 'exam', e.target.value)}
                              className="w-16 bg-primary-50 border-none rounded-lg px-2 py-1.5 text-center font-bold text-primary-600 outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </td>
                        </>
                      )}
                      <td className="py-4 text-center">
                        {s.optional ? (
                          <button 
                            onClick={() => toggleIncluded(s.name)}
                            className={cn(
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mx-auto",
                              grades[s.name]?.included ? "bg-primary-600 border-primary-600 text-white" : "border-slate-200"
                            )}
                          >
                            {grades[s.name]?.included && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">إجباري</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 font-bold">
                        {t.choose_correct_stream}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={calculateAverage}
                className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-100 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                {t.calculate_average}
              </button>
              <button
                onClick={reset}
                className="px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                {t.reset}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Calculator className="w-6 h-6 text-primary-400" />
                {t.result}
              </h3>

              <div className="text-center py-10">
                <AnimatePresence mode="wait">
                  {result !== null ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <p className="text-6xl font-black text-white tabular-nums">
                        {result.toFixed(2)}
                      </p>
                      <div className={cn(
                        "inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest",
                        result >= 10 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {result >= 10 ? t.passed : t.failed}
                      </div>
                      
                      {result >= 16 && <p className="text-amber-400 font-bold text-sm">ممتاز! 🎉</p>}
                      {result >= 14 && result < 16 && <p className="text-primary-300 font-bold text-sm">جيد جداً! 👍</p>}
                      {result >= 12 && result < 14 && <p className="text-primary-300 font-bold text-sm">جيد! ✨</p>}
                      {result >= 10 && result < 12 && <p className="text-primary-300 font-bold text-sm">مقبول. 📚</p>}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4 opacity-40"
                    >
                      <p className="text-6xl font-black text-white tabular-nums">--.--</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {t.enter_notes_to_calc}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Info className="w-5 h-5 text-primary-600" />
              {t.information}
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {mode === 'bac' 
                    ? t.bac_formula_desc
                    : t.yearly_formula_desc
                  }
                </p>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                  {t.choose_stream_warning}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
