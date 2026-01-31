import { GoogleGenAI } from "@google/genai";
import { ArtStyle, PanelCount } from "../types";
import { IDEA_CATEGORIES } from "../constants";

// Initialize Gemini
// Note: In a real production app, ensure this is handled securely.
// The System Prompt guarantees process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-3-flash-preview';

export const generateStoryIdeas = async (): Promise<string[]> => {
  try {
    const randomCategories = IDEA_CATEGORIES.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const prompt = `
      Generate 10 unique, creative, and distinct short story ideas or topics suitable for a visual storyboard.
      Focus on these themes: ${randomCategories.join(', ')}.
      
      Output ONLY a JSON array of strings. Do not add markdown formatting or code blocks.
      Example: ["A robot learning to love", "The life cycle of a coffee bean"]
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // Parse JSON
    const ideas = JSON.parse(text);
    return Array.isArray(ideas) ? ideas : [];
  } catch (error) {
    console.error("Error generating ideas:", error);
    // Fallback ideas if API fails
    return [
      "رحلة قطرة مطر من السحابة إلى البحر",
      "تطور وسائل الاتصال عبر العصور",
      "يوم في حياة رائد فضاء",
      "تحضير وجبة تقليدية خطوة بخطوة",
      "نمو شجرة بلوط عبر الفصول الأربعة",
      "قصة صداقة بين طفل وروبوت",
      "بناء منزل من الأساس إلى النهاية",
      "رحلة عبر الزمن إلى مصر القديمة",
      "تحول يرقة إلى فراشة ملونة",
      "تعلم ركوب الدراجة لأول مرة"
    ];
  }
};

export const generateFinalPrompt = async (
  topic: string,
  panelCount: PanelCount,
  style: ArtStyle | null,
  customStyle: string
): Promise<string> => {
  const styleDescription = customStyle.trim() !== '' 
    ? customStyle 
    : `${style?.nameEn} (${style?.description})`;

  const gridLayout = panelCount === 9 ? "3x3" : "3x4";

  const systemInstruction = `
    You are an expert AI art prompt engineer. Your goal is to write highly detailed, creative, and technical prompts for image generation models like Midjourney, FLUX, or DALL-E.
    You specialize in creating "multi-panel" or "grid" layouts in a single image.
  `;

  const userPrompt = `
    Create a detailed image generation prompt for a single image containing ${panelCount} numbered panels arranged in a ${gridLayout} grid layout.
    
    The story/topic is: "${topic}"
    The art style is: "${styleDescription}"
    
    STRUCTURE THE OUTPUT EXACTLY AS FOLLOWS (English Only):

    Create a single image containing ${panelCount} numbered panels arranged in a ${gridLayout} grid layout, telling the story of [topic]. Each panel must be clearly numbered (1, 2, 3...) in the top corner.

    Style: ${styleDescription}

    Panel 1: [Creative, visual description of the first scene]
    Panel 2: [Creative, visual description of the next scene]
    ...
    Panel ${panelCount}: [Creative, visual description of the final scene]

    Technical specifications:
    - Art style: ${styleDescription}
    - Color scheme: [Suggest 3-4 specific colors that fit the mood]
    - Lighting: [Describe the lighting setup, e.g., cinematic, natural, neon]
    - Overall mood: [Adjectives describing the emotion]
    - Quality: high quality, detailed, professional, 8k, masterpiece
    - Ensure consistent art style, lighting, and quality across all panels
    - Each panel should have clear panel borders
    - Numbers should be visible and clear in each panel
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Creativity balance
      }
    });
    
    return response.text || "Failed to generate prompt. Please try again.";
  } catch (error) {
    console.error("Error generating prompt:", error);
    return "Error: Could not generate prompt. Please check your connection or try a different topic.";
  }
};
