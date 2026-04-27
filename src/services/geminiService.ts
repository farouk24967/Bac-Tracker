/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCpvYN6oUVDNCA-f2uN1nT5BuwtpKCSvWc' 
});

export const generateStudyAdvice = async (stream: string, average: number, target: number, lang: string = 'fr') => {
  const languageNames: Record<string, string> = {
    fr: 'français',
    en: 'anglais',
    ar: 'arabe',
    es: 'espagnol'
  };
  const targetLang = languageNames[lang] || 'français';

  const now = new Date();
  const timeStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const prompt = `En tant qu'expert du Bac en Algérie, donne des conseils personnalisés à un étudiant de la filière ${stream}. 
  Date actuelle : ${dateStr}, Heure : ${timeStr}.
  Sa moyenne actuelle est de ${average}/20 et son objectif est de ${target}/20. 
  Propose une stratégie de révision globale, les matières à prioriser et comment atteindre son objectif. 
  Réponds en ${targetLang} de manière motivante et structurée.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Error generating study advice:", error);
    return lang === 'ar' ? "عذراً، لم أتمكن من إنشاء النصائح في الوقت الحالي. حاول مرة أخرى لاحقاً!" : "Désolé, je n'ai pas pu générer de conseils pour le moment. Réessaie plus tard !";
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
  const timeStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const systemInstruction = `Tu es "DzBac AI", un assistant pédagogique expert pour les étudiants du Bac en Algérie. 
  Ton but est d'aider l'étudiant à réussir son Bac avec la meilleure mention possible.
  Profil de l'étudiant: Filière ${userProfile.stream}, Moyenne actuelle ${userProfile.currentAverage}, Objectif ${userProfile.targetGrade}.
  
  MÉMOIRE DU SYSTÈME (CONTEXTE TEMPS RÉEL) :
  - Date d'aujourd'hui : ${dateStr}
  - Heure actuelle : ${timeStr}
  - Localisation : Algérie (Cloud DZ)
  
  FONCTIONNALITÉS SPÉCIALES (AJOUT AU TABLEAU DE BORD / CALENDRIER) :
  Tu peux exécuter des outils pour ajouter directement des tâches et des sessions pour l'utilisateur.
  Si l'utilisateur demande d'ajouter une tâche ou une session de révision, SUIS CE PROCESSUS ÉTAPE PAR ÉTAPE :
  1. Identifie les informations manquantes. 
  Pour une tâche, il faut: Titre, Matière, Date d'échéance (YYYY-MM-DD), Priorité (high/medium/low), Temps estimé en minutes.
  Pour une session: Titre, Matière, Date (YYYY-MM-DD), Heure de début (HH:mm), Durée en minutes, Brève description.
  2. Si des informations manquent, POSE DES QUESTIONS à l'utilisateur pour les obtenir (par exemple, "Pour quelle matière voulez-vous cette tâche ? et pour quelle date ?").
  3. Une fois que TU AS TOUTES LES INFORMATIONS, utilise l'appel de fonction approprié (addTaskToDashboard ou addScheduledSession). Ne liste pas les étapes, appelle juste la fonction.

  IMPORTANT : Tu maîtrises toutes les langues du monde. 
  Tu dois répondre dans la langue utilisée par l'étudiant (Français, Arabe classique, Anglais, Espagnol, etc.).
  Tu ES PARTICULIÈREMENT encouragé à comprendre et à utiliser le DARIJA ALGÉRIEN (arabe dialectal algérien) si l'étudiant l'utilise, pour créer une relation de proximité et de confiance (ex: "Saha", "Besah", "Khoya/Khti", "Bon courage kima nqolo").
  
  Sois toujours encourageant, précis et utilise des termes familiers aux étudiants algériens (ex: "filière", "mention", "coefficient", "rattrapage").
  Si l'étudiant pose une question pédagogique complexe, assure-toi que l'explication reste claire et académiquement rigoureuse, même si tu utilises un ton amical.`;

  const functionDeclarations = [
    {
      name: "addTaskToDashboard",
      description: "Ajoute une tâche directement dans le tableau de bord (dashboard) de l'utilisateur.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Titre de la tâche (ex: Faire exercice 4)" },
          subject: { type: Type.STRING, description: "Nom de la matière" },
          dueDate: { type: Type.STRING, description: "Date d'échéance au format YYYY-MM-DD" },
          priority: { type: Type.STRING, description: "Niveau de priorité: 'high', 'medium', 'low'" },
          estimatedTime: { type: Type.NUMBER, description: "Temps estimé en minutes (ex: 60)" }
        },
        required: ["title", "subject", "dueDate", "priority", "estimatedTime"]
      }
    },
    {
      name: "addScheduledSession",
      description: "Ajoute une session d'étude directement dans le calendrier (calendar) de l'utilisateur.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Titre de la session (ex: مراجعة الرياضيات - الدوال)" },
          subjectId: { type: Type.STRING, description: "Nom de la matière" },
          date: { type: Type.STRING, description: "Date de la session au format YYYY-MM-DD" },
          startTime: { type: Type.STRING, description: "Heure de début au format HH:mm" },
          duration: { type: Type.NUMBER, description: "Durée en minutes" },
          description: { type: Type.STRING, description: "Description de ce qui sera révisé" }
        },
        required: ["title", "subjectId", "date", "startTime", "duration", "description"]
      }
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        ...chatHistory.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        tools: [{ functionDeclarations }]
      }
    });

    const calls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);
    
    if (calls && calls.length > 0) {
      const successMessages = [];
      
      for (const part of calls) {
        const call = part.functionCall!;
        if (call.name === "addTaskToDashboard") {
          const args = call.args as any;
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
          successMessages.push(lang === 'ar' ? `تم إضافة المهمة "${args.title}" بنجاح إلى مهامك!` : `Tâche "${args.title}" ajoutée avec succès !`);
        } else if (call.name === "addScheduledSession") {
          const args = call.args as any;
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
          successMessages.push(lang === 'ar' ? `تم إضافة الحصة "${args.title}" بنجاح إلى التقويم الخاص بك!` : `Session "${args.title}" ajoutée avec succès au calendrier !`);
        }
      }
      
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return text + (text ? "\n\n" : "") + successMessages.join("\n");
    }

    return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Error in AI chat:", error);
    return lang === 'ar' ? "عذراً، واجهت مشكلة تقنية صغيرة. هل يمكنك إعادة صياغة سؤالك؟" : "Oups, j'ai eu un petit problème technique. Peux-tu reformuler ta question ?";
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
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Error analyzing performance:", error);
    return lang === 'ar' ? "خطأ أثناء تحليل الأداء." : "Erreur lors de l'analyse des performances.";
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
    const contents: any[] = [{ parts: [{ text: prompt }] }];
    
    if (fileData) {
      contents[0].parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return lang === 'ar' ? "خطأ أثناء إنشاء بطاقات المراجعة." : "Erreur lors de la génération des flashcards.";
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
    const contents: any[] = [{ parts: [{ text: prompt }] }];
    
    if (fileData) {
      contents[0].parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Error generating summary:", error);
    return lang === 'ar' ? "خطأ أثناء إنشاء الملخص." : "Erreur lors de la génération du résumé.";
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
  
  IMPORTANT : Réponds UNIQUEMENT avec un tableau JSON valide contenant des objets avec cette structure exacte, sans aucun texte avant ou après, et sans markdown de bloc de code (pas de \`\`\`json) :
  [
    {
      "title": "Nom de la session en arabe (ex: مراجعة الرياضيات - المتتاليات العددية)",
      "date": "YYYY-MM-DD",
      "startTime": "HH:mm",
      "duration": 60,
      "description": "Description précise en arabe incluant le chapitre spécifique du programme algérien",
      "subjectId": "Nom de la matière en arabe"
    }
  ]
  
  Assure-toi que les dates sont au format YYYY-MM-DD et commencent à partir de ${today}. Les heures (startTime) doivent être réalistes (entre 08:00 et 22:30) et ne pas se chevaucher.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    let text = response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    // Clean up potential markdown formatting
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
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
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Error generating daily report:", error);
    return lang === 'ar' ? "خطأ أثناء إنشاء التقرير اليومي." : "Erreur lors de la génération du rapport quotidien.";
  }
};
