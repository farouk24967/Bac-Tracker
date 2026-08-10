import { invokeAI } from './aiProxy';

const MODEL_NAME = 'gemini_3_flash';

export async function getRecommendations(grades: any[], subjects: any[]) {
  const prompt = `
    Analyze these grades and subjects for an Algerian BAC student.
    Grades: ${JSON.stringify(grades)}
    Subjects: ${JSON.stringify(subjects)}
    
    Provide a brief analysis of their strengths and weaknesses, and give 3 actionable recommendations to improve their average in French.
  `;

  try {
    const response = await invokeAI({
      model: MODEL_NAME,
      prompt: prompt
    });
    return typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
    return `Erreur technique: ${error?.message || 'Erreur API'}`;
  }
}

export async function analyzeImage(imageBase64: string, mimeType: string, prompt: string) {
  try {
    const response = await invokeAI({
      model: MODEL_NAME,
      prompt: prompt,
      file_urls: [`data:${mimeType};base64,${imageBase64}`]
    });
    return typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return `Erreur technique: ${error?.message || 'Erreur API'}`;
  }
}

export async function chatWithGemini(prompt: string) {
  const fullPrompt = `System: You are an AI tutor helping an Algerian BAC student. Be encouraging, concise, and helpful in French. You can help with math, physics, languages, and study tips.
  
  User: ${prompt}`;
  try {
    const response = await invokeAI({
      model: MODEL_NAME,
      prompt: fullPrompt
    });
    return typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error: any) {
    console.error('Error chatting with Gemini:', error);
    return `Erreur technique: ${error?.message || 'Erreur API'}`;
  }
}
