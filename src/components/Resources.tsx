import React, { useState, useEffect } from 'react';
import { 
  Video, 
  FileText, 
  ExternalLink, 
  Search, 
  Filter,
  BookOpen,
  PlayCircle,
  Download,
  GraduationCap,
  ChevronRight,
  Star,
  MessageSquare, 
  Brain, 
  Zap,
  Sparkles,
  Info,
  TrendingUp,
  Layers,
  Loader2,
  RefreshCw,
  Upload,
  File,
  X as XIcon,
  Check,
  Copy,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, UserProfile, SubjectProgress, Stream, AITool, Resource } from '../types';
import { translations } from '../translations';
import { cn } from '../lib/utils';
import { TEACHER_RESOURCES } from '../data/resourceData';
import { SUBJECTS_BY_STREAM, AI_TOOLS, STREAMS } from '../constants';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { checkBadges } from '../lib/gamificationUtils';
import { jsPDF } from 'jspdf';
import { analyzePerformance, generateFlashcards, generateModernSummary } from '../services/geminiService';
import Markdown from 'react-markdown';

const ICON_MAP: Record<string, any> = {
  MessageSquare,
  Brain,
  Search,
  Zap,
  PlayCircle
};

const RESOURCES: Resource[] = [
  ...TEACHER_RESOURCES.map(t => ({
    id: t.id,
    title: `Chaîne YouTube : ${t.name}`,
    subject: t.subject,
    type: t.type,
    url: t.url,
    author: t.name,
    description: t.description,
    category: 'youtube' as const
  })),
  {
    id: 'site-1',
    title: 'DZExams - Sujets et Corrigés',
    subject: 'Général',
    type: 'link',
    url: 'https://www.dzexams.com/ar/3as',
    author: 'DZExams',
    category: 'website',
    description: 'Le plus grand site de sujets de baccalauréat en Algérie.'
  },
  {
    id: 'site-2',
    title: 'Eddirasa - Portail Éducatif',
    subject: 'Général',
    type: 'link',
    url: 'https://www.eddirasa.com/bac-algerie/',
    author: 'Eddirasa',
    category: 'website',
    description: 'Cours, résumés et exercices pour toutes les matières.'
  },
  {
    id: 'res-1',
    title: 'Résumé Physique - Unité 1',
    subject: 'العلوم الفيزيائية',
    type: 'pdf',
    url: 'https://drive.google.com/uc?export=download&id=1-O6F_B8M7Pz7lY_V5qD9f-7XzP5M4G3H',
    author: 'DzBac Academy',
    category: 'file',
    description: 'Résumé complet pour réviser la première unité de physique.'
  },
  {
    id: 'res-2',
    title: 'الكتاب المدرسي الكامل لمادة الرياضيات',
    subject: 'الرياضيات',
    type: 'pdf',
    url: 'https://drive.google.com/uc?export=download&id=1PJcOg622fuS_JYGZwW3GZxFCgoPCaUhr',
    author: 'وزارة التربية',
    category: 'file',
    description: 'Le livre officiel du ministère de l\'éducation.'
  },
  {
    id: 'res-3',
    title: 'ملخص الشريعة الإسلامية - جميع الوحدات',
    subject: 'التربية الإسلامية',
    type: 'pdf',
    url: 'https://drive.google.com/uc?export=download&id=1S7_6V7Jk5_4hDk_S0tXQYkG_p9R-p7y',
    author: 'الأستاذ بوسعادي',
    category: 'file',
    description: 'Un résumé complet en éducation islamique.'
  },
  {
    id: 'res-4',
    title: 'Série d\'exercices Corrigés - Nombres Complexes',
    subject: 'الرياضيات',
    type: 'pdf',
    url: 'https://drive.google.com/uc?export=download&id=1Xy8eR0iU-W2jKLMK_QO9XzA5L1P0f4Uv',
    author: 'Prof Merniz',
    category: 'file',
    description: 'Une excellente série d\'exercices pour maîtriser les nombres complexes.'
  },
  {
    id: 'site-3',
    title: 'Sujets Bac Algérie - Archives',
    subject: 'Général',
    type: 'link',
    url: 'https://ency-education.com/bac.html',
    author: 'Ency Education',
    category: 'website',
    description: 'Archive complète des sujets de baccalauréat algérien depuis des années.'
  },
  {
    id: 'site-4',
    title: 'Ouedkniss - Livres Scolaires',
    subject: 'Général',
    type: 'link',
    url: 'https://www.ouedkniss.com/livres-scolaires-algerie',
    author: 'Ouedkniss',
    category: 'website',
    description: 'Trouvez des livres et manuels scolaires d\'occasion.'
  },
  {
    id: 'site-5',
    title: 'A9ra Online',
    subject: 'Général',
    type: 'link',
    url: 'https://a9ra.ba-dz.com/',
    author: 'A9ra Online',
    category: 'website',
    description: 'Propose des cours détaillés, des exercices corrigés et des sujets de bac.'
  },
  {
    id: 'site-6',
    title: 'Bac.onec.dz',
    subject: 'Général',
    type: 'link',
    url: 'http://bac.onec.dz/',
    author: 'ONEC',
    category: 'website',
    description: 'Site officiel pour la consultation des résultats du baccalauréat.'
  },
  {
    id: 'site-7',
    title: 'Bac-algerie.net',
    subject: 'Général',
    type: 'link',
    url: 'https://www.bac-algerie.net/',
    author: 'Bac-Algerie',
    category: 'website',
    description: 'Base de données complète des sujets et corrections de 2008 à 2025.'
  },
  {
    id: 'site-8',
    title: 'iMadrassa',
    subject: 'Général',
    type: 'link',
    url: 'https://imadrassa.com/',
    author: 'iMadrassa',
    category: 'website',
    description: 'Spécialisé dans le soutien scolaire en ligne avec des quiz et cours conformes au programme.'
  },
  {
    id: 'app-1',
    title: 'Bac dans ta poche (Bac Feljib)',
    subject: 'Général',
    type: 'link',
    url: 'https://play.google.com/store/apps/details?id=com.bacfildjib',
    author: 'Bac Feljib',
    category: 'app',
    description: 'Application mobile regroupant des leçons, résumés et annales.'
  },
  {
    id: 'site-9',
    title: 'Wilgo AI',
    subject: 'Général',
    type: 'link',
    url: 'https://wilgo.ai/',
    author: 'Wilgo',
    category: 'app',
    description: 'IA gratuite pour la révision personnalisée basée sur les annales.'
  }
];

interface ResourcesProps {
  userProfile: UserProfile;
}

export const Resources: React.FC<ResourcesProps> = ({ userProfile }) => {
  const [filter, setFilter] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'youtube' | 'website' | 'file' | 'app'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [category, setCategory] = useState<'profs' | 'ai'>('profs');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  
  // AI Tools State
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [flashcardStream, setFlashcardStream] = useState<Stream>(userProfile.stream || STREAMS[0]);
  const [flashcards, setFlashcards] = useState<string | null>(null);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [localFavorites, setLocalFavorites] = useState<string[]>(userProfile.favorites || []);
  
  useEffect(() => {
    setLocalFavorites(userProfile.favorites || []);
  }, [userProfile.favorites]);
  
  const [summaryTopic, setSummaryTopic] = useState('');
  const [summaryStream, setSummaryStream] = useState<Stream>(userProfile.stream || STREAMS[0]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string, size: string, content?: string, mimeType: string, base64Data: string }[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);

  const lang: Language = userProfile.language || 'fr';
  const t = translations[lang];

  const streamRaw = (userProfile.stream || STREAMS[0]).trim();
  const stream = STREAMS.find(s => s === streamRaw || s.toLowerCase() === streamRaw.toLowerCase()) || STREAMS[0];
  const allowedSubjects = SUBJECTS_BY_STREAM[stream] || [];

  useEffect(() => {
    if (!userProfile.uid) return;
    const path = 'subjectProgress';
    const q = query(collection(db, path), where('uid', '==', userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProgress(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectProgress)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [userProfile.uid]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          const base64Data = result.split(',')[1];
          const newFile = {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            mimeType: file.type,
            base64Data: base64Data,
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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzePerformance(userProfile, progress);
    setAnalysis(result);
    setIsAnalyzing(false);
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleFavorite = async (resourceId: string) => {
    if (!userProfile.uid) return;
    
    const isFavorite = localFavorites.includes(resourceId);
    
    // Optimistic update
    const updatedFavorites = isFavorite 
      ? localFavorites.filter(id => id !== resourceId)
      : [...localFavorites, resourceId];
    
    setLocalFavorites(updatedFavorites);

    const userRef = doc(db, 'users', userProfile.uid);
    const path = `users/${userProfile.uid}`;

    try {
      await updateDoc(userRef, {
        favorites: isFavorite ? arrayRemove(resourceId) : arrayUnion(resourceId)
      });
    } catch (error) {
      // Revert if error
      setLocalFavorites(userProfile.favorites || []);
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const toggleProfessor = (professor: string) => {
    setSelectedProfessors(prev => 
      prev.includes(professor) ? prev.filter(p => p !== professor) : [...prev, professor]
    );
  };

  const handleResourceClick = async () => {
    await checkBadges(userProfile, { action: 'scholar' as any });
  };

  const professors = Array.from(new Set(RESOURCES.map(r => r.author))).sort();

  const filteredResources = RESOURCES.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(filter.toLowerCase()) || 
                          r.subject.toLowerCase().includes(filter.toLowerCase()) ||
                          r.author.toLowerCase().includes(filter.toLowerCase());
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(r.type);
    const isRelevantToStream = allowedSubjects.includes(r.subject) || r.subject === 'Général';
    const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(r.subject) || r.subject === 'Général';
    const matchesProfessor = selectedProfessors.length === 0 || selectedProfessors.includes(r.author);
    const matchesViewMode = viewMode === 'all' || localFavorites.includes(r.id);
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    
    return matchesSearch && matchesType && isRelevantToStream && matchesSubject && matchesProfessor && matchesViewMode && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex bg-white p-1.5 rounded-3xl border border-slate-100 shadow-sm self-start inline-flex">
        <button
          onClick={() => setCategory('profs')}
          className={cn(
            "px-8 py-3 rounded-2xl text-sm font-black transition-all",
            category === 'profs' ? "bg-primary-600 text-white shadow-xl shadow-primary-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}
        >
          {t.teacher_resources}
        </button>
        <button
          onClick={() => setCategory('ai')}
          className={cn(
            "px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2",
            category === 'ai' ? "bg-primary-600 text-white shadow-xl shadow-primary-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}
        >
          <Sparkles className={cn("w-4 h-4", category === 'ai' ? "text-primary-200" : "text-slate-300")} />
          {t.ai_resources}
        </button>
      </div>

      {category === 'profs' && (
        <div className="flex flex-wrap gap-2 md:gap-3">
          {[
            { id: 'all', label: lang === 'ar' ? 'الكل' : 'Tout', icon: Layers },
            { id: 'youtube', label: lang === 'ar' ? 'قنوات يوتيوب' : 'Chaînes YouTube', icon: Video },
            { id: 'website', label: lang === 'ar' ? 'مواقع تعليمية' : 'Sites Web', icon: ExternalLink },
            { id: 'app', label: lang === 'ar' ? 'تطبيقات' : 'Applications', icon: Smartphone },
            { id: 'file', label: lang === 'ar' ? 'ملخصات و ملفات' : 'Fichiers & Résumés', icon: FileText },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={cn(
                "flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-bold transition-all border shadow-sm",
                selectedCategory === cat.id 
                  ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm"
                  : "bg-white border-slate-100 text-slate-500 hover:border-primary-100 shadow-sm"
              )}
            >
              <cat.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {viewMode === 'all' ? t.resources : t.favorites}
          </h2>
          <p className="text-slate-500 mt-1 text-xs md:text-base">
            {viewMode === 'all' 
              ? (lang === 'ar' ? "الوصول إلى أفضل المحتويات التعليمية." : "Accède aux meilleurs contenus.")
              : (lang === 'ar' ? "المصادر التي فضلتها." : "Retrouve tes favoris.")
            }
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex bg-white p-1 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm self-start">
            <button
              onClick={() => setViewMode('all')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold transition-all",
                viewMode === 'all' ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {t.all_resources}
            </button>
            <button
              onClick={() => setViewMode('favorites')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold transition-all flex items-center gap-1.5 md:gap-2",
                viewMode === 'favorites' ? "bg-yellow-500 text-white shadow-xl shadow-yellow-100" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Star className={cn("w-3.5 h-3.5 md:w-4 h-4", viewMode === 'favorites' ? "fill-current" : "")} />
              {t.favorites}
            </button>
          </div>

          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400",
              lang === 'ar' ? "right-4" : "left-4"
            )} />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={lang === 'ar' ? "البحث عن درس..." : "Rechercher un cours..."}
              className={cn(
                "py-3 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-64",
                lang === 'ar' ? "pr-12 pl-6" : "pl-12 pr-6"
              )}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['video', 'pdf', 'link'].map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`p-3 rounded-2xl border transition-all ${
                  selectedTypes.includes(type) 
                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-100' 
                    : 'bg-white border-slate-100 text-slate-500 hover:border-primary-200'
                }`}
              >
                {type === 'video' && <Video className="w-5 h-5" />}
                {type === 'pdf' && <FileText className="w-5 h-5" />}
                {type === 'link' && <ExternalLink className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {category === 'profs' ? (
        <>
          <div className="flex flex-wrap gap-2 pb-2">
            <div className="flex items-center gap-2 mr-2 text-slate-400">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {lang === 'ar' ? 'المواد:' : 'Matières :'}
              </span>
            </div>
            {allowedSubjects.map(subject => (
              <button
                key={subject}
                onClick={() => toggleSubject(subject)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  selectedSubjects.includes(subject)
                    ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm"
                    : "bg-white border-slate-100 text-slate-500 hover:border-primary-100"
                )}
              >
                {subject}
              </button>
            ))}
            {selectedSubjects.length > 0 && (
              <button
                onClick={() => setSelectedSubjects([])}
                className="px-4 py-2 rounded-full text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
              >
                {lang === 'ar' ? 'مسح الكل' : 'Effacer'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pb-2">
            <div className="flex items-center gap-2 mr-2 text-slate-400">
              <GraduationCap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {lang === 'ar' ? 'الأساتذة:' : 'Professeurs :'}
              </span>
            </div>
            {professors.map(professor => (
              <button
                key={professor}
                onClick={() => toggleProfessor(professor)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  selectedProfessors.includes(professor)
                    ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm"
                    : "bg-white border-slate-100 text-slate-500 hover:border-amber-100"
                )}
              >
                {professor}
              </button>
            ))}
            {selectedProfessors.length > 0 && (
              <button
                onClick={() => setSelectedProfessors([])}
                className="px-4 py-2 rounded-full text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
              >
                {lang === 'ar' ? 'مسح الكل' : 'Effacer'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredResources.map((resource, idx) => (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-primary-50/50 transition-all flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${
                        resource.type === 'video' ? 'bg-red-50 text-red-600' :
                        resource.type === 'pdf' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {resource.type === 'video' ? <PlayCircle className="w-6 h-6" /> :
                        resource.type === 'pdf' ? <Download className="w-6 h-6" /> : <ExternalLink className="w-6 h-6" />}
                      </div>
                      
                      <button 
                        onClick={() => toggleFavorite(resource.id)}
                        className={cn(
                          "p-3 rounded-2xl border transition-all hover:scale-110 active:scale-95 group/fav",
                          localFavorites.includes(resource.id) 
                            ? "bg-yellow-50 border-yellow-200 text-yellow-500 shadow-sm shadow-yellow-50" 
                            : "bg-white border-slate-100 text-slate-300 hover:border-yellow-100 hover:text-yellow-400"
                        )}
                      >
                        <Star 
                          className={cn(
                            "w-5 h-5 transition-all duration-300", 
                            localFavorites.includes(resource.id) ? "fill-current scale-110" : "group-hover/fav:scale-110"
                          )} 
                        />
                      </button>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full" dir="rtl">
                      {resource.subject}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {resource.title}
                  </h4>

                  {resource.description && (
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                      {resource.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-6">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">{resource.author}</span>
                  </div>

                  <div className="mt-auto">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleResourceClick}
                      className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-bold py-3 rounded-2xl hover:bg-primary-600 hover:text-white transition-all group/btn"
                    >
                      {resource.type === 'pdf' ? (lang === 'ar' ? "تحميل الملف" : "Télécharger le fichier") : 
                       resource.type === 'video' ? (lang === 'ar' ? "مشاهدة الفيديو" : "Voir la vidéo") :
                       (lang === 'ar' ? "زيارة الموقع" : "Visiter le site")}
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-transform",
                        lang === 'ar' ? "rotate-180 group-hover/btn:-translate-x-1" : "group-hover/btn:translate-x-1"
                      )} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      ) : (
        /* AI TOOLS SECTION */
        <div className="space-y-12">
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
                {analysis ? (lang === 'ar' ? 'إعادة التحليل' : 'Relancer l\'analyse') : t.analyze_notes}
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
                    {lang === 'ar' ? "أضف علاماتك في لوحة التحكم للسماح بالتحليل." : "Ajoute tes notes dans le tableau de bord pour permettre l'analyse."}
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
                <h3 className="text-xl font-bold text-slate-900">{lang === 'ar' ? "رفع الملفات" : "Charger des fichiers"}</h3>
                <p className="text-slate-500 text-sm">
                  {lang === 'ar' ? "ارفع دروسك أو ملخصاتك لاستخدامها مع الذكاء الاصطناعي." : "Charge tes cours ou résumés pour les utiliser avec l'IA."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-[32px] hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer group">
                <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform mb-4">
                  <Upload className="w-8 h-8 text-primary-600" />
                </div>
                <p className="font-bold text-slate-900 mb-1">{lang === 'ar' ? "اضغط للرفع" : "Clique pour uploader"}</p>
                <p className="text-xs text-slate-400">{lang === 'ar' ? "أي صيغة (PDF, DOCX, JPG...)" : "Tous formats (PDF, DOCX, JPG...)"}</p>
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
                          {lang === 'ar' ? 'مختار' : 'Sélectionné'}
                        </span>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                    <File className="w-8 h-8 text-slate-200 mb-2" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{lang === 'ar' ? "لا توجد ملفات" : "Aucun fichier"}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-amber-50 p-3 rounded-2xl">
                  <Layers className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{t.flashcards}</h3>
                  <p className="text-slate-500 text-sm">
                    {lang === 'ar' ? "أنشئ بطاقات مراجعة بنقرة واحدة." : "Crée des cartes de révision en un clic."}
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
                    placeholder={lang === 'ar' ? "الموضوع (مثال: الانقسام الخيطي، ثورة التحرير...)" : "Sujet (ex: La mitose, Guerre de libération...)"}
                    className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <button
                    onClick={handleGenerateFlashcards}
                    disabled={isGeneratingFlashcards || !flashcardTopic.trim()}
                    className="bg-amber-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-amber-700 transition-all disabled:opacity-50 shadow-lg shadow-amber-100 w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {isGeneratingFlashcards ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                    {isGeneratingFlashcards ? (lang === 'ar' ? 'جاري التوليد...' : 'Génération...') : t.generate}
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
                          >
                            <Download className="w-4 h-4" />
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

            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-purple-50 p-3 rounded-2xl">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{t.summary}</h3>
                  <p className="text-slate-500 text-sm">
                    {lang === 'ar' ? "ملخصات منظمة للبكالوريا الجزائرية." : "Des résumés structurés pour le Bac algérien."}
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
                    placeholder={lang === 'ar' ? "الموضوع (مثال: النهايات والاتصال، الأحماض...)" : "Sujet (ex: Limites et continuité, Les acides...)"}
                    className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary || !summaryTopic.trim()}
                    className="bg-purple-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-100 w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {isGeneratingSummary ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                    {isGeneratingSummary ? (lang === 'ar' ? 'جاري التوليد...' : 'Génération...') : t.generate}
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
                          >
                            <Download className="w-4 h-4" />
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
            {AI_TOOLS.map((tool, idx) => {
              const Icon = ICON_MAP[tool.icon] || Sparkles;
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all"
                >
                  {tool.videoUrl && (
                    <div className="p-2">
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                        <iframe
                          src={tool.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0]}
                          className="absolute inset-0 w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={tool.name}
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl text-primary-600 transition-transform group-hover:scale-110">
                          {tool.logoUrl ? (
                            <img 
                              src={tool.logoUrl} 
                              alt={tool.name} 
                              className="w-8 h-8 object-contain" 
                              referrerPolicy="no-referrer"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : <Icon className="w-8 h-8" />}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900">{tool.name}</h3>
                          <p className="text-slate-500 text-sm font-medium">{tool.description}</p>
                        </div>
                      </div>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary-50 text-primary-600 p-3 rounded-xl hover:bg-primary-600 hover:text-white transition-all"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>

                    {tool.prompts && tool.prompts.length > 0 && (
                      <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 items-start border border-blue-100/50">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-widest">
                          {t.open_tool}
                        </p>
                      </div>
                    )}
                  </div>

                  {tool.prompts && tool.prompts.length > 0 && (
                    <div className="p-8 space-y-4 bg-slate-50/30">
                      {tool.prompts.map((prompt: any, pIdx: number) => {
                        const id = `${idx}-${pIdx}`;
                        return (
                          <div key={pIdx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-primary-200 transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{prompt.title}</span>
                              <button
                                onClick={() => copyToClipboard(prompt.text, id)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                                  copiedIndex === id 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-slate-100 text-slate-500 hover:bg-primary-600 hover:text-white'
                                )}
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
      )}

      {category === 'profs' && filteredResources.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            {viewMode === 'favorites' ? <Star className="w-8 h-8 text-slate-300" /> : <BookOpen className="w-8 h-8 text-slate-300" />}
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {viewMode === 'favorites' ? t.no_favorites : (lang === 'ar' ? "لم يتم العثور على أي مصدر" : "Aucune ressource trouvée")}
          </h3>
          <p className="text-slate-500">
            {viewMode === 'favorites' 
              ? (lang === 'ar' ? "اضغط على النجمة لحفظ مصادرك المفضلة." : "Clique sur l'étoile pour sauvegarder tes ressources préférées.")
              : (lang === 'ar' ? "حاول تغيير معايير البحث الخاصة بك." : "Essaie de modifier tes critères de recherche.")
            }
          </p>
        </div>
      )}
    </div>
  );
};
