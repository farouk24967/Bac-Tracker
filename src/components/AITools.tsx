import React, { useState, useEffect } from 'react';
import { AI_TOOLS, STREAMS } from '../constants';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Brain, 
  Search, 
  Zap,
  Info,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  Layers,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  File,
  X,
  PlayCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, SubjectProgress, Language, Stream, AITool } from '../types';
import { safeT } from '../translations';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { analyzePerformance, generateFlashcards, generateModernSummary, generateStudySchedule } from '../services/geminiService';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { Task, StudyGoal, ScheduledSession } from '../types';

const ICON_MAP: Record<string, any> = {
  MessageSquare,
  Brain,
  Search,
  Zap,
  PlayCircle
};

interface AIToolsProps {
  userProfile: UserProfile;
}

export const AITools: React.FC<AIToolsProps> = ({ userProfile }) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const lang: Language = userProfile.language || 'fr';
  const tDict = {
    fr: {
      analyze_again: "Relancer l'analyse",
      add_notes_for_analysis: "Ajoute tes notes dans le tableau de bord pour permettre l'analyse.",
      smart_study_plan: "Plan d'étude Intelligent",
      custom_schedule_desc: "Obtiens un emploi du temps personnalisé basé sur tes performances.",
      update_plan: 'Actualiser le plan',
      generate_plan: 'Générer mon plan',
      day_label: 'JOUR',
      no_sessions_today: 'Aucune session prévue pour ce jour.',
      generate_plan_desc: "Génère intelligemment ton emploi du temps pour la semaine prochaine afin d'optimiser tes révisions.",
      upload_files: 'Charger des fichiers',
      upload_files_desc: "Charge tes cours ou résumés pour les utiliser avec l'IA.",
      click_to_upload: 'Clique pour uploader',
      all_formats: 'Tous formats (PDF, DOCX, JPG...)',
      selected: 'Sélectionné',
      no_files: 'Aucun fichier',
      file_reference: (name: string) => `Le contenu de "${name}" sera utilisé comme référence lors de la génération.`,
      flashcards_one_click: 'Crée des cartes de révision en un clic.',
      topic_placeholder_flashcards: 'Sujet (ex: La mitose, Guerre de libération...)',
      generating: 'Génération...',
      structured_summaries: 'Des résumés structurés pour le Bac algérien.',
      topic_placeholder_summary: 'Sujet (ex: Limites et continuité, Les acides...)',
      video_not_supported: 'Votre navigateur ne supporte pas la lecture de vidéos.'
    },
    en: {
      analyze_again: "Re-run the analysis",
      add_notes_for_analysis: 'Add your grades in the dashboard to enable the analysis.',
      smart_study_plan: 'Smart Study Plan',
      custom_schedule_desc: 'Get a personalized schedule based on your performance and goals.',
      update_plan: 'Update the plan',
      generate_plan: 'Generate my plan',
      day_label: 'DAY',
      no_sessions_today: 'No sessions scheduled for this day.',
      generate_plan_desc: 'Smartly generate your schedule for next week to optimize your revision.',
      upload_files: 'Upload files',
      upload_files_desc: 'Upload your lessons or summaries to use them with the AI.',
      click_to_upload: 'Click to upload',
      all_formats: 'All formats (PDF, DOCX, JPG...)',
      selected: 'Selected',
      no_files: 'No files',
      file_reference: (name: string) => `The content of "${name}" will be used as a reference during generation.`,
      flashcards_one_click: 'Create revision flashcards in one click.',
      topic_placeholder_flashcards: 'Topic (e.g.: Mitosis, Liberation War...)',
      generating: 'Generating...',
      structured_summaries: 'Structured summaries for the Algerian Bac.',
      topic_placeholder_summary: 'Topic (e.g.: Limits and continuity, Acids...)',
      video_not_supported: 'Your browser does not support video playback.'
    },
    es: {
      analyze_again: 'Relanzar el análisis',
      add_notes_for_analysis: 'Añade tus notas en el panel para permitir el análisis.',
      smart_study_plan: 'Plan de estudio inteligente',
      custom_schedule_desc: 'Obtén un horario personalizado según tu rendimiento y tus objetivos.',
      update_plan: 'Actualizar el plan',
      generate_plan: 'Generar mi plan',
      day_label: 'DÍA',
      no_sessions_today: 'No hay sesiones previstas para este día.',
      generate_plan_desc: 'Genera inteligentemente tu horario para la próxima semana para optimizar tus revisiones.',
      upload_files: 'Subir archivos',
      upload_files_desc: 'Sube tus lecciones o resúmenes para usarlos con la IA.',
      click_to_upload: 'Haz clic para subir',
      all_formats: 'Todos los formatos (PDF, DOCX, JPG...)',
      selected: 'Seleccionado',
      no_files: 'Sin archivos',
      file_reference: (name: string) => `El contenido de "${name}" se utilizará como referencia durante la generación.`,
      flashcards_one_click: 'Crea tarjetas de revisión en un clic.',
      topic_placeholder_flashcards: 'Tema (ej: Mitosis, Guerra de liberación...)',
      generating: 'Generando...',
      structured_summaries: 'Resúmenes estructurados para el Bac argelino.',
      topic_placeholder_summary: 'Tema (ej: Límites y continuidad, Los ácidos...)',
      video_not_supported: 'Tu navegador no admite la reproducción de vídeo.'
    },
    ar: {
      analyze_again: 'إعادة التحليل',
      add_notes_for_analysis: 'أضف علاماتك في لوحة التحكم للسماح بالتحليل.',
      smart_study_plan: 'مخطط الدراسة الذكي',
      custom_schedule_desc: 'احصل على جدول مخصص بناءً على أدائك وأهدافك.',
      update_plan: 'تحديث المخطط',
      generate_plan: 'إنشاء المخطط',
      day_label: 'يوم',
      no_sessions_today: 'لا توجد جلسات مقررة لهذا اليوم.',
      generate_plan_desc: 'أنشئ جدولًا مخصصًا للأسبوع القادم بذكاء لتحسين مراجعتك.',
      upload_files: 'رفع الملفات',
      upload_files_desc: 'ارفع دروسك أو ملخصاتك لاستخدامها مع الذكاء الاصطناعي.',
      click_to_upload: 'اضغط للرفع',
      all_formats: 'أي صيغة (PDF, DOCX, JPG...)',
      selected: 'مختار',
      no_files: 'لا توجد ملفات',
      file_reference: (name: string) => `سيتم استخدام محتوى "${name}" كمرجع عند إنشاء الملخصات أو البطاقات.`,
      flashcards_one_click: 'أنشئ بطاقات مراجعة بنقرة واحدة.',
      topic_placeholder_flashcards: 'الموضوع (مثال: الانقسام الخيطي، ثورة التحرير...)',
      generating: 'جاري التوليد...',
      structured_summaries: 'ملخصات منظمة للبكالوريا الجزائرية.',
      topic_placeholder_summary: 'الموضوع (مثال: النهايات والاتصال، الأحماض...)',
      video_not_supported: 'متصفحك لا يدعم تشغيل الفيديو.'
    }
  };
  const t = { ...safeT(lang), ...(tDict[lang] || tDict.fr) };
  const locale = lang === 'ar' ? 'ar-EG' : lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-FR';
  
  // Analysis State
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Study Plan State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  // Flashcards State
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [flashcardStream, setFlashcardStream] = useState<Stream>(userProfile.stream || STREAMS[0]);
  const [flashcards, setFlashcards] = useState<string | null>(null);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // Summary State
  const [summaryTopic, setSummaryTopic] = useState('');
  const [summaryStream, setSummaryStream] = useState<Stream>(userProfile.stream || STREAMS[0]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string, size: string, content?: string, mimeType: string, base64Data: string }[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          // Extract base64 without the header "data:<mimeType>;base64,"
          const base64Data = result.split(',')[1];
          
          const newFile = {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            mimeType: file.type,
            base64Data: base64Data,
            // Fallback for text files if needed for displaying (not strictly needed now but kept for compatibility)
            content: file.type.startsWith('text/') ? atob(base64Data) : '' 
          };
          setUploadedFiles(prev => [...prev, newFile]);
        };
        
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFileIndex === index) setSelectedFileIndex(null);
    else if (selectedFileIndex !== null && selectedFileIndex > index) setSelectedFileIndex(selectedFileIndex - 1);
  };

  const toggleFileSelection = (index: number) => {
    setSelectedFileIndex(prev => prev === index ? null : index);
  };

  const downloadAsPDF = (text: string, filename: string) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 10, 10);
    doc.save(`${filename}.pdf`);
  };

  const downloadAsTXT = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
    const tasksQuery = query(collection(db, 'tasks'), where('uid', '==', userProfile.uid));
    const goalsQuery = query(collection(db, 'studyGoals'), where('uid', '==', userProfile.uid));

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });
    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyGoal)));
    });

    return () => {
      unsubTasks();
      unsubGoals();
    };
  }, [userProfile.uid]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzePerformance(userProfile, progress);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    const result = await generateStudySchedule(tasks, goals, userProfile, progress);
    setStudyPlan(result);
    setIsGeneratingPlan(false);
  };

  const handleGenerateFlashcards = async () => {
    if (!flashcardTopic.trim()) return;
    setIsGeneratingFlashcards(true);
    const context = selectedFileIndex !== null ? (uploadedFiles[selectedFileIndex].content || '') : '';
    const fileData = selectedFileIndex !== null ? {
      mimeType: uploadedFiles[selectedFileIndex].mimeType,
      data: uploadedFiles[selectedFileIndex].base64Data
    } : undefined;
    
    const result = await generateFlashcards(flashcardTopic, flashcardStream, lang, context, fileData);
    setFlashcards(result);
    setIsGeneratingFlashcards(false);
  };

  const handleGenerateSummary = async () => {
    if (!summaryTopic.trim()) return;
    setIsGeneratingSummary(true);
    const context = selectedFileIndex !== null ? (uploadedFiles[selectedFileIndex].content || '') : '';
    const fileData = selectedFileIndex !== null ? {
      mimeType: uploadedFiles[selectedFileIndex].mimeType,
      data: uploadedFiles[selectedFileIndex].base64Data
    } : undefined;

    const result = await generateModernSummary(summaryTopic, summaryStream, lang, context, fileData);
    setSummary(result);
    setIsGeneratingSummary(false);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="bg-gradient-to-r from-primary-600 to-purple-700 p-6 md:p-10 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-2 md:p-3 rounded-2xl">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">{t.ai_tools}</h2>
        </div>
        <p className="text-primary-100 text-sm md:text-lg max-w-2xl leading-relaxed">
          {t.ai_tools_desc}
        </p>
      </div>

      {/* AI Performance Analysis */}
      <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t.ai_analysis}</h3>
              <p className="text-slate-500 text-sm">{t.ai_advice}</p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || progress.length === 0}
            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-lg shadow-primary-100 w-full sm:w-auto"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            {analysis ? t.analyze_again : t.analyze_notes}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-50 p-8 rounded-2xl border border-slate-100"
            >
              <div className="prose prose-slate max-w-none">
                <Markdown>{analysis}</Markdown>
              </div>
            </motion.div>
          )}
          {!analysis && !isAnalyzing && progress.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400">
                {t.add_notes_for_analysis}
              </p>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* AI Study Plan Generator */}
      <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary-50 p-3 rounded-2xl">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t.smart_study_plan}</h3>
              <p className="text-slate-500 text-sm">
                {t.custom_schedule_desc}
              </p>
            </div>
          </div>
          <button
            onClick={handleGeneratePlan}
            disabled={isGeneratingPlan}
            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-lg shadow-primary-100 w-full sm:w-auto"
          >
            {isGeneratingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            {studyPlan.length > 0 ? t.update_plan : t.generate_plan}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {studyPlan.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <button 
                  onClick={() => setSelectedDayOffset(prev => Math.max(0, prev - 1))}
                  disabled={selectedDayOffset === 0}
                  className="p-2 hover:bg-primary-50 rounded-xl transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5 text-primary-600" />
                </button>
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                    {t.day_label} {selectedDayOffset + 1}
                  </p>
                  <p className="font-bold text-slate-900">
                    {new Date(new Date().getTime() + (selectedDayOffset * 24 * 60 * 60 * 1000)).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedDayOffset(prev => Math.min(6, prev + 1))}
                  disabled={selectedDayOffset === 6}
                  className="p-2 hover:bg-primary-50 rounded-xl transition-all disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5 text-primary-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {studyPlan
                  .filter(session => session.date === new Date(new Date().getTime() + (selectedDayOffset * 24 * 60 * 60 * 1000)).toISOString().split('T')[0])
                  .length > 0 ? (
                    studyPlan
                      .filter(session => session.date === new Date(new Date().getTime() + (selectedDayOffset * 24 * 60 * 60 * 1000)).toISOString().split('T')[0])
                      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                      .map((session, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all group"
                        >
                          <div className="bg-primary-50 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 group-hover:bg-primary-600 transition-colors">
                            <Clock className="w-5 h-5 text-primary-600 group-hover:text-white mb-0.5" />
                            <span className="text-[10px] font-black text-primary-600 group-hover:text-white leading-none">{session.startTime}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                {session.subjectId}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {session.duration} MIN
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                              {session.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {session.description}
                            </p>
                          </div>
                          <button className="hidden sm:flex p-3 text-slate-300 hover:text-primary-600 hover:bg-slate-50 rounded-xl transition-all">
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                       <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                       <p className="text-slate-400 text-sm font-medium italic">
                         {t.no_sessions_today}
                       </p>
                    </div>
                  )}
              </div>
            </motion.div>
          ) : !isGeneratingPlan && (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="bg-white w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Calendar className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-400 max-w-sm mx-auto">
                {t.generate_plan_desc}
              </p>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* File Upload Section */}
      <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary-50 p-3 rounded-2xl">
            <Upload className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{t.upload_files}</h3>
            <p className="text-slate-500 text-sm">
              {t.upload_files_desc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-[32px] hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer group">
            <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform mb-4">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <p className="font-bold text-slate-900 mb-1">{t.click_to_upload}</p>
            <p className="text-xs text-slate-400">{t.all_formats}</p>
            <input type="file" multiple className="hidden" onChange={handleFileUpload} />
          </label>

          <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
            {uploadedFiles.length > 0 ? uploadedFiles.map((file, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all group cursor-pointer",
                  selectedFileIndex === idx 
                    ? "bg-primary-50 border-primary-200 shadow-sm" 
                    : "bg-slate-50 border-slate-100"
                )}
                onClick={() => toggleFileSelection(idx)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg shadow-sm transition-colors",
                    selectedFileIndex === idx ? "bg-primary-600 text-white" : "bg-white text-slate-400"
                  )}>
                    <File className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-bold truncate max-w-[150px]",
                      selectedFileIndex === idx ? "text-primary-900" : "text-slate-800"
                    )}>{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{file.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedFileIndex === idx && (
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-100 px-2 py-1 rounded-md">
                      {t.selected}
                    </span>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                <File className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.no_files}</p>
              </div>
            )}
          </div>
        </div>
        {selectedFileIndex !== null && (
          <div className="mt-4 p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <p className="text-sm text-primary-900 font-medium">
              {t.fileReference(uploadedFiles[selectedFileIndex].name)}
            </p>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Flashcards Generator */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-amber-50 p-3 rounded-2xl">
              <Layers className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t.flashcards}</h3>
              <p className="text-slate-500 text-sm">
                {t.flashcards_one_click}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                {t.select_stream}
              </label>
              <select
                value={flashcardStream}
                onChange={(e) => setFlashcardStream(e.target.value as Stream)}
                className="bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-amber-500 outline-none appearance-none cursor-pointer"
              >
                {STREAMS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={flashcardTopic}
                onChange={(e) => setFlashcardTopic(e.target.value)}
                placeholder={t.topic_placeholder_flashcards}
                className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                onClick={handleGenerateFlashcards}
                disabled={isGeneratingFlashcards || !flashcardTopic.trim()}
                className="bg-amber-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-amber-700 transition-all disabled:opacity-50 shadow-lg shadow-amber-100 w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {isGeneratingFlashcards ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {isGeneratingFlashcards ? t.generating : t.generate}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {flashcards && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <h4 className="text-sm font-bold text-slate-900">Résultat</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 rounded-xl p-1">
                      <button
                        onClick={() => downloadAsPDF(flashcards, 'flashcards')}
                        className="p-2 hover:bg-white rounded-lg transition-all text-slate-600 hover:text-primary-600"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadAsTXT(flashcards, 'flashcards')}
                        className="p-2 hover:bg-white rounded-lg transition-all text-slate-600 hover:text-primary-600"
                        title="Download TXT"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => copyToClipboard(flashcards, 'flashcards')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        copiedIndex === 'flashcards' 
                          ? "bg-green-500 text-white" 
                          : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                      )}
                    >
                      {copiedIndex === 'flashcards' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === 'flashcards' ? t.copied : t.copy}
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100 overflow-y-auto max-h-[400px] custom-scrollbar">
                  <div className="prose prose-amber prose-sm max-w-none">
                    <Markdown>{flashcards}</Markdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Modern Summary Generator */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-purple-50 p-3 rounded-2xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t.summary}</h3>
              <p className="text-slate-500 text-sm">
                {t.structured_summaries}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                {t.select_stream}
              </label>
              <select
                value={summaryStream}
                onChange={(e) => setSummaryStream(e.target.value as Stream)}
                className="bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
              >
                {STREAMS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={summaryTopic}
                onChange={(e) => setSummaryTopic(e.target.value)}
                placeholder={t.topic_placeholder_summary}
                className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary || !summaryTopic.trim()}
                className="bg-purple-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-100 w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {isGeneratingSummary ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                {isGeneratingSummary ? t.generating : t.generate}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <h4 className="text-sm font-bold text-slate-900">Résultat</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 rounded-xl p-1">
                      <button
                        onClick={() => downloadAsPDF(summary, 'summary')}
                        className="p-2 hover:bg-white rounded-lg transition-all text-slate-600 hover:text-primary-600"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadAsTXT(summary, 'summary')}
                        className="p-2 hover:bg-white rounded-lg transition-all text-slate-600 hover:text-primary-600"
                        title="Download TXT"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => copyToClipboard(summary, 'summary')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        copiedIndex === 'summary' 
                          ? "bg-green-500 text-white" 
                          : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                      )}
                    >
                      {copiedIndex === 'summary' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === 'summary' ? t.copied : t.copy}
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100 overflow-y-auto max-h-[400px] custom-scrollbar">
                  <div className="prose prose-purple prose-sm max-w-none">
                    <Markdown>{summary}</Markdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(AI_TOOLS as AITool[]).map((tool, toolIdx) => {
          const Icon = ICON_MAP[tool.icon] || Sparkles;
          
          return (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: toolIdx * 0.1 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
            >
              {tool.videoUrl && (
                <div className="p-2 pt-2 px-2">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
                    {tool.videoType === 'youtube' ? (
                      <iframe
                        src={tool.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0]}
                        className={cn(
                          "absolute inset-0 w-full h-full border-0",
                          "transition-transform transform hover:scale-105 duration-700"
                        )}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={tool.name}
                      />
                    ) : (
                      <video 
                        className="absolute inset-0 w-full h-full object-cover"
                        controls
                        src={tool.videoUrl}
                      >
                        {t.video_not_supported}
                      </video>
                    )}
                  </div>
                </div>
              )}

              <div className="p-8 border-b border-slate-50 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl text-primary-600">
                      {tool.logoUrl ? (
                        <img 
                          src={tool.logoUrl} 
                          alt={tool.name} 
                          className="w-8 h-8 object-contain rounded-lg" 
                          referrerPolicy="no-referrer" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            // This won't trigger the fallback in the current structure easily without state
                            // but let's just make it graceful
                          }}
                        />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{tool.name}</h3>
                      <p className="text-slate-500 text-sm">{tool.description}</p>
                    </div>
                  </div>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-50 text-primary-600 p-3 rounded-xl hover:bg-primary-100 transition-all group"
                  >
                    <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                </div>

                {tool.prompts.length > 0 && (
                  <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 items-start border border-blue-100/50">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {t.open_tool}
                    </p>
                  </div>
                )}
              </div>

              {tool.prompts.length > 0 && (
                <div className="p-8 space-y-6 flex-1 bg-slate-50/30">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.prompts_title}</h4>
                  {tool.prompts.map((prompt, pIdx) => {
                    const id = `${toolIdx}-${pIdx}`;
                    return (
                      <div key={pIdx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:border-primary-200 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-slate-800">{prompt.title}</span>
                          <button
                            onClick={() => copyToClipboard(prompt.text, id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              copiedIndex === id 
                                ? 'bg-green-500 text-white' 
                                : 'bg-slate-50 text-slate-500 hover:bg-primary-50 hover:text-primary-600'
                            }`}
                          >
                            {copiedIndex === id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedIndex === id ? t.copied : t.copy}
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 italic leading-relaxed">
                          "{prompt.text}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
