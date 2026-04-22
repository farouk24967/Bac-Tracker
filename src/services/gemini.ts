import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'AIzaSyCpvYN6oUVDNCA-f2uN1nT5BuwtpKCSvWc' });

export async function getRecommendations(grades: any[], subjects: any[]) {
  const prompt = `
    Analyze these grades and subjects for an Algerian BAC student.
    Grades: ${JSON.stringify(grades)}
    Subjects: ${JSON.stringify(subjects)}
    
    Provide a brief analysis of their strengths and weaknesses, and give 3 actionable recommendations to improve their average.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
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
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
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
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an AI tutor helping an Algerian BAC student. Be encouraging, concise, and helpful. You can help with math, physics, languages, and study tips.",
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error chatting with Gemini:', error);
    return 'Sorry, I am having trouble connecting right now.';
  }
}
