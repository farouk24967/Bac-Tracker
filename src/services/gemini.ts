import { GoogleGenAI, ThinkingLevel } from '@google/genai';

// Initialize the Gemini AI with the API Key from environment variables
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCpvYN6oUVDNCA-f2uN1nT5BuwtpKCSvWc' 
});

// Use a stable and fast model
const MODEL_NAME = 'gemini-1.5-flash';

export async function getRecommendations(grades: any[], subjects: any[]) {
  const prompt = `
    Analyze these grades and subjects for an Algerian BAC student.
    Grades: ${JSON.stringify(grades)}
    Subjects: ${JSON.stringify(subjects)}
    
    Provide a brief analysis of their strengths and weaknesses, and give 3 actionable recommendations to improve their average in French.
  `;

  try {
    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return 'Unable to generate recommendations at this time.';
  }
}

export async function analyzeImage(imageBase64: string, mimeType: string, prompt: string) {
  try {
    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const response = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      }],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return 'Unable to analyze image at this time.';
  }
}

export async function chatWithGemini(prompt: string) {
  try {
    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are an AI tutor helping an Algerian BAC student. Be encouraging, concise, and helpful in French. You can help with math, physics, languages, and study tips.",
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error chatting with Gemini:', error);
    return 'Désolé, j\'ai du mal à me connecter en ce moment.';
  }
}
