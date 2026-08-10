/// <reference types="vite/client" />
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { invokeAI } from "./aiProxy";

const localeFor = (lang: string) => lang === 'ar' ? 'ar-EG' : lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-FR';

const langText = (lang: string) => {
  const d = {
    fr: { taskAdded: (title: string) => `Tâche "${title}" ajoutée avec succès !`, sessionAdded: (title: string) => `Session "${title}" ajoutée avec succès au calendrier !` },
    en: { taskAdded: (title: string) => `Task "${title}" added successfully!`, sessionAdded: (title: string) => `Session "${title}" added successfully to your calendar!` },
    es: { taskAdded: (title: string) => `¡Tarea "${title}" añadida con éxito!`, sessionAdded: (title: string) => `¡Sesión "${title}" añadida con éxito a tu calendario!` },
    ar: { taskAdded: (title: string) => `تم إضافة المهمة "${title}" بنجاح إلى مهامك!`, sessionAdded: (title: string) => `تم إضافة الحصة "${title}" بنجاح إلى التقويم الخاص بك!` }
  };
  return d[lang as keyof typeof d] || d.fr;
};

export const generateStudyAdvice = async (stream: string, average: number, target: number, lang: string = 'fr') => {
  const languageNames: Record<string, string> = {
    fr: 'français',
    en: 'anglais',
    ar: 'arabe',
    es: 'espagnol'
  };
  const targetLang = languageNames[lang] || 'français';

  const now = new Date();
  const timeStr = now.toLocaleTimeString(localeFor(lang), { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString(localeFor(lang), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const prompt = `En tant qu'expert du Bac en Algérie, donne des conseils personnalisés à un étudiant de la filière ${stream}. 
  Date actuelle : ${dateStr}, Heure : ${timeStr}.
  Sa moyenne actuelle est de ${average}/20 et son objectif est de ${target}/20. 
  Propose une stratégie de révision globale, les matières à prioriser et comment atteindre son objectif. 
  Réponds en ${targetLang} de manière motivante et structurée.`;

  try {
    const response = await invokeAI({
      prompt: prompt,
      model: "gemini_3_flash",
    });
    return typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error: any) {
    console.error("Error generating study advice:", error);
    return `Erreur technique: ${error?.message || 'Erreur API'}`;
  }
};

export const chatWithAI = async (message: string, userProfile: any, chatHistory: { role: string, parts: { text: string }[] }[]) => {
  const lang = userProfile.language || 'fr';
  const languageNames: Record<string, string> = {
    fr: 'français',
    en: 'anglais',
    ar: 'arabe',
    es: 'espagnol'
  };
  const targetLang = languageNames[lang] || 'français';

  const now = new Date();
  const timeStr = now.toLocaleTimeString(localeFor(lang), { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString(localeFor(lang), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const systemInstruction = `Tu es "DzBac AI", un assistant pédagogique expert pour les étudiants du Bac en Algérie. 
  Ton but est d'aider l'étudiant à réussir son Bac avec la meilleure mention possible.
  Profil de l'étudiant: Filière ${userProfile.stream}, Moyenne actuelle ${userProfile.currentAverage}, Objectif ${userProfile.targetGrade}.
  
  MÉMOIRE DU SYSTÈME (CONTEXTE TEMPS RÉEL) :
  - Date d'aujourd'hui : ${dateStr}
  - Heure actuelle : ${timeStr}
  - Localisation : Algérie (Cloud DZ)
  
  FONCTIONNALITÉS SPÉCIALES (AJOUT AU TABLEAU DE BORD / CALENDRIER) :
  Si l'utilisateur demande d'ajouter une tâche ou une session de révision, SUIS CE PROCESSUS ÉTAPE PAR ÉTAPE :
  1. Identifie les informations manquantes. 
  Pour une tâche, il faut: Titre, Matière, Date d'échéance (YYYY-MM-DD), Priorité (high/medium/low), Temps estimé en minutes.
  Pour une session: Titre, Matière, Date (YYYY-MM-DD), Heure de début (HH:mm), Durée en minutes, Brève description.
  2. Si des informations manquent, POSE DES QUESTIONS à l'utilisateur pour les obtenir.
  3. Une fois que TU AS TOUTES LES INFORMATIONS, tu dois répondre avec un appel de fonction au format JSON (décrit ci-dessous).

  IMPORTANT : Tu maîtrises toutes les langues du monde. 
  Tu dois répondre dans la langue utilisée par l'étudiant.
  Tu ES PARTICULIÈREMENT encouragé à comprendre et à utiliser le DARIJA ALGÉRIEN si l'étudiant l'utilise.
  
  Sois toujours encourageant, précis et utilise des termes familiers aux étudiants algériens.`;

  const historyText = chatHistory.map(h => `${h.role}: ${h.parts.map(p => p.text).join(' ')}`).join('\n');

  const prompt = `${systemInstruction}
  
  CONTEXTE DE LA CONVERSATION:
  ${historyText}
  
  Utilisateur: "${message}"
  
  RÈGLES DE RÉPONSE:
  Si tu as toutes les informations pour ajouter une tâche ou une session, réponds EXACTEMENT et UNIQUEMENT avec ce format JSON (aucun autre texte):
  {
    "functionCall": {
      "name": "addTaskToDashboard", // ou "addScheduledSession"
      "args": {
        // Pour addTaskToDashboard: "title", "subject", "dueDate" (YYYY-MM-DD), "priority", "estimatedTime"
        // Pour addScheduledSession: "title", "subjectId", "date" (YYYY-MM-DD), "startTime" (HH:mm), "duration", "description"
      }
    }
  }
  
  Sinon, réponds normalement en tant qu'assistant.`;

  try {
    const response = await invokeAI({
      prompt,
      model: "gemini_3_flash"
    });

    const text = typeof response === 'string' ? response : JSON.stringify(response);

    // Parse potential function calls
    try {
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      if (jsonStr.startsWith('{') && jsonStr.includes('functionCall')) {
        const parsed = JSON.parse(jsonStr);
        if (parsed.functionCall) {
          const call = parsed.functionCall;
          const successMessages = [];
          
          if (call.name === "addTaskToDashboard") {
            const args = call.args;
            await addDoc(collection(db, 'tasks'), {
              title: args.title,
              subject: args.subject,
              dueDate: args.dueDate,
              priority: args.priority,
              estimatedTime: args.estimatedTime,
              completed: false,
              uid: userProfile.uid,
              createdAt: new Date().toISOString()
            });
            successMessages.push(langText(lang).taskAdded(args.title));
          } else if (call.name === "addScheduledSession") {
            const args = call.args;
            await addDoc(collection(db, 'scheduledSessions'), {
              title: args.title,
              subjectId: args.subjectId,
              date: args.date,
              startTime: args.startTime,
              duration: args.duration,
              description: args.description,
              completed: false,
              uid: userProfile.uid,
              createdAt: new Date().toISOString()
            });
            successMessages.push(langText(lang).sessionAdded(args.title));
          }
          
          return successMessages.join("\n");
        }
      }
    } catch (e) {
      // Not a valid JSON function call, will return normally
    }

    return text;
  } catch (error: any) {
    console.error("Error in AI chat:", error);
    return `Erreur technique: ${error?.message || 'Erreur API'}`;
  }
};

export const analyzePerformance = async (userProfile: any, progress: any[]) => {
  const lang = userProfile.language || 'fr';
  const languageNames: Record<string, string> = {
    fr: 'français',
    en: 'anglais',
    ar: 'arabe',
    es: 'espagnol'
  };
  const targetLang = languageNames[lang] || 'français';
  const progressText = progress.map(p => `${p.subjectId}: ${p.progress}%`).join(', ');
  const gradesText = userProfile.currentGrades 
    ? Object.entries(userProfile.currentGrades).map(([s, g]) => `${s}: ${g}/20`).join(', ')
    : 'Aucune note saisie';

  const prompt = `En tant qu'expert du Bac en Algérie, analyse les performances de cet étudiant :
  Filière : ${userProfile.stream}
  Moyenne actuelle : ${userProfile.currentAverage}/20
  Objectif : ${userProfile.targetGrade}/20
  Notes réelles par matière : ${gradesText}
  Progression par matière (activités) : ${progressText}
  
  Donne une analyse détaillée des points forts et des points faibles. 
  Suggère des axes d'amélioration concrets et personnalisés pour atteindre l'objectif de ${userProfile.targetGrade}/20.
  Réponds en ${targetLang} de manière structurée avec des conseils spécifiques au programme algérien.`;

  try {
    const response = await invokeAI({
      prompt: prompt,
      model: "gemini_3_flash"
    });
    return typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error: any) {
    console.error("Error analyzing performance:", error);
    return `Erreur technique: ${error?.message || 'Erreur API'}`;
  }
};

export const generateFlashcards = async (topic: string, stream: string, lang: string = 'fr', context: string = '', fileData?: { mimeType: string, data: string }) => {
  const languageNames: Record<string, string> = {
    fr: 'français',
    en: 'anglais',
    ar: 'arabe',
    es: 'espagnol'
  };
  const targetLang = languageNames[lang] || 'français';
  const contextPrompt = context ? `\n\nUtilise également ce contexte textuel fourni par l'utilisateur pour générer les cartes :\n"${context}"` : '';
  
  const prompt = `Génère 5 flashcards modernes et efficaces pour un étudiant du Bac en Algérie (filière ${stream}) sur le sujet suivant : "${topic}".${contextPrompt}
  Si un fichier (image, PDF ou vidéo) est joint, utilise-le comme source d'information principale pour extraire les questions et réponses.
  Chaque flashcard doit avoir une question claire au recto et une réponse concise et précise au verso.
  Le format doit être :
  Q: [Question]
  R: [Réponse]
  ---
  Q: [Question]
  R: [Réponse]
  ...
  Réponds en ${targetLang}.
  Adapte le contenu au programme officiel algérien.`;

  try {
    const file_urls: string[] = [];
    if (fileData) {
      file_urls.push(`data:${fileData.mimeType};base64,${fileData.data}`);
    }

    const response = await invokeAI({
      prompt: prompt,
      model: "gemini_3_flash",
      ...(file_urls.length > 0 ? { file_urls } : {})
    });
    return typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error: any) {
    console.error("Error generating flashcards:", error);
    return `Erreur technique: ${error?.message || 'Erreur API'}`;
  }
};

export const generateModernSummary = async (topic: string, stream: string, lang: string = 'fr', context: string = '', fileData?: { mimeType: string, data: string }) => {
  const languageNames: Record<string, string> = {
    fr: 'français',
    en: 'anglais',
    ar: 'arabe',
    es: 'espagnol'
  };
  const targetLang = languageNames[lang] || 'français';
  const contextPrompt = context ? `\n\nUtilise également ce contexte textuel fourni par l'utilisateur pour créer le résumé :\n"${context}"` : '';

  const prompt = `Crée un résumé moderne, visuel et structuré pour un étudiant du Bac en Algérie (filière ${stream}) sur le sujet : "${topic}".${contextPrompt}
  Si un fichier (image, PDF ou vidéo) est joint, analyse-le attentivement pour en extraire les points clés.
  Le résumé doit inclure :
  1. Les concepts clés à retenir absolument.
  2. Les formules ou dates importantes (selon la matière).
  3. Une astuce de mémorisation ou un conseil d'examen.
  4. Les erreurs fréquentes à éviter.
  Réponds en ${targetLang}.
  Utilise un ton motivant et un formatage clair (Markdown).`;

  try {
    const file_urls: string[] = [];
    if (fileData) {
      file_urls.push(`data:${fileData.mimeType};base64,${fileData.data}`);
    }

    const response = await invokeAI({
      prompt: prompt,
      model: "gemini_3_flash",
      ...(file_urls.length > 0 ? { file_urls } : {})
    });
    return typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error: any) {
    console.error("Error generating summary:", error);
    return `Erreur technique: ${error?.message || 'Erreur API'}`;
  }
};

export const generateStudySchedule = async (tasks: any[], goals: any[], userProfile: any, progress: any[] = []) => {
  const lang = userProfile.language || 'fr';
  const languageNames: Record<string, string> = {
    fr: 'français',
    en: 'anglais',
    ar: 'arabe',
    es: 'espagnol'
  };
  const targetLang = languageNames[lang] || 'français';
  
  const today = new Date().toISOString().split('T')[0];
  const weakSubjects = userProfile.aiAnalysis?.weaknesses || [];
  const strengths = userProfile.aiAnalysis?.strengths || [];
  const currentGrades = userProfile.currentGrades || {};
  
  const prompt = `Tu es un expert en planification d'études pour le Bac en Algérie.
  Profil de l'étudiant : Filière ${userProfile.stream}, Objectif : ${userProfile.targetGrade}/20.
  Matières faibles (selon l'IA) : ${weakSubjects.join(', ')}.
  Matières fortes (selon l'IA) : ${strengths.join(', ')}.
  Notes réelles (moyennes) : ${JSON.stringify(currentGrades)}
  Progression actuelle (activités) : ${JSON.stringify(progress.map(p => ({ subject: p.subjectId, progress: p.progress })))}
  Tâches actuelles : ${JSON.stringify(tasks.map(t => ({ title: t.title, subject: t.subject, deadline: t.dueDate })))}
  Objectifs : ${JSON.stringify(goals.map(g => ({ title: g.title, target: g.targetValue, unit: g.unit })))}
  
  Génère un planning de révision intelligent pour les 7 prochains jours à partir d'aujourd'hui (${today}).
  
  IMPORTANT : TOUS les textes (titres, descriptions, matières) DOIVENT être en ARABE (langue arabe classique).
  
  RÈGLES DE PLANIFICATION :
  1. Alloue PLUS de temps (sessions plus longues ou plus fréquentes) aux matières faibles.
  2. Répartis les sessions de manière équilibrée sur la journée en respectant ces créneaux :
     - MATIN : de 08:00 à 12:00
     - APRÈS-MIDI : de 13:30 à 17:30
     - SOIR : de 19:00 à 22:30
  3. Priorise les tâches dont la deadline est proche.
  4. Pour chaque session, identifie des LEÇONS et CHAPITRES réels du programme officiel Algérien (ex: المتتاليات، الأعداد المركبة، الميكانيك، إلخ) correspondant à la filière "${userProfile.stream}".
  5. Inclus des sessions de rappel pour les matières fortes.
  6. Adapte la difficulté des sessions en fonction de la progression.
  
  Assure-toi que les dates sont au format YYYY-MM-DD et commencent à partir de ${today}. Les heures (startTime) doivent être réalistes (entre 08:00 et 22:30) et ne pas se chevaucher.`;

  try {
    const response = await invokeAI({
      prompt: prompt,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            date: { type: "string" },
            startTime: { type: "string" },
            duration: { type: "number" },
            description: { type: "string" },
            subjectId: { type: "string" }
          },
          required: ["title", "date", "startTime", "duration", "description", "subjectId"]
        }
      }
    });
    
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Error generating study schedule:", error);
    return [];
  }
};

export const generateDailyReport = async (userProfile: any, activities: any[], lang: string = 'fr') => {
  const languageNames: Record<string, string> = {
    fr: 'français',
    en: 'anglais',
    ar: 'arabe',
    es: 'espagnol'
  };
  const targetLang = languageNames[lang] || 'français';
  
  const activitiesText = activities.map(a => `- ${a.title} (${a.subject}) à ${new Date(a.timestamp).toLocaleTimeString()}`).join('\n');
  
  const prompt = `En tant qu'assistant "DzBac AI", génère un rapport quotidien motivant et analytique pour cet étudiant du Bac en Algérie.
  Profil : Filière ${userProfile.stream}, Objectif ${userProfile.targetGrade}/20.
  
  Activités du jour :
  ${activitiesText || "Aucune activité enregistrée aujourd'hui."}
  
  Le rapport doit :
  1. Résumer ce qui a été accompli aujourd'hui.
  2. Calculer le temps total estimé (si applicable).
  3. Donner un score de productivité sur 10.
  4. Offrir un conseil spécifique pour demain basé sur ces activités.
  5. Finir par une citation motivante en rapport avec les efforts fournis.
  
  Réponds en ${targetLang} de manière structurée et chaleureuse. Utilise le format Markdown.`;

  try {
    const response = await invokeAI({
      prompt: prompt,
      model: "gemini_3_flash"
    });
    return typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error: any) {
    console.error("Error generating daily report:", error);
    return `Erreur technique: ${error?.message || 'Erreur API'}`;
  }
};
