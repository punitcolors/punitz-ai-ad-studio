
import { GoogleGenAI, Type } from "@google/genai";
import { CreativeDirection, ShotType } from "../types";

const API_KEY = process.env.API_KEY;

export const analyzeImagesAndGeneratePrompt = async (
  productBase64: string,
  modelBase64: string,
  direction: CreativeDirection
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `You are a Senior Creative Director. 
  Analyze the provided product image and model image. 
  Based on the direction "${direction}", create a single highly detailed, 
  commercial-grade image generation prompt. 
  The prompt should describe the scene, lighting, composition, and mood, 
  combining the product and model naturally.
  Do not include any text, logos, or frames in the description.
  Return ONLY the prompt string.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: productBase64.split(',')[1], mimeType: 'image/png' } },
        { inlineData: { data: modelBase64.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    },
    config: {
      temperature: 0.8,
    }
  });

  return response.text || "A high-end commercial photo of the product with the model.";
};

export const generateCommercialImage = async (
  prompt: string,
  aspectRatio: string,
  productBase64: string | null,
  modelBase64: string | null,
  shotType: ShotType
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Enrich prompt with shot type
  const enrichedPrompt = `${prompt}. Shot style: ${shotType}. Commercial ad-grade realism, ultra-high resolution, sharp focus, professional lighting. NO TEXT, NO LOGOS.`;

  const parts: any[] = [{ text: enrichedPrompt }];
  
  if (productBase64) {
    parts.push({ inlineData: { data: productBase64.split(',')[1], mimeType: 'image/png' } });
  }
  if (modelBase64) {
    parts.push({ inlineData: { data: modelBase64.split(',')[1], mimeType: 'image/png' } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
      }
    }
  });

  let imageUrl = '';
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) throw new Error("No image was generated");
  return imageUrl;
};
