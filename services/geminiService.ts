
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MODELS } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      console.error("GeminiService: API Key is missing. Ensure process.env.API_KEY is configured in your environment.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async chat(message: string) {
    try {
      const chatInstance = this.ai.chats.create({
        model: MODELS.CHAT,
        config: {
          systemInstruction: "You are Mourish AI, a world-class professional AI assistant. You are helpful, precise, and concise.",
        }
      });
      const response = await chatInstance.sendMessage({ message });
      return response;
    } catch (error) {
      console.error("GeminiService.chat error:", error);
      throw error;
    }
  }

  async searchGrounding(query: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: MODELS.SEARCH,
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      return response;
    } catch (error) {
      console.error("GeminiService.searchGrounding error:", error);
      throw error;
    }
  }

  async generateCode(prompt: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: MODELS.BUILDER,
        contents: `Create a single-file web application based on this request: "${prompt}". 
        Return ONLY the complete HTML code including Tailwind CSS via CDN and any necessary JS. 
        Do not include markdown code blocks, just the raw code.`,
        config: {
          temperature: 0.2,
        },
      });
      return response.text;
    } catch (error) {
      console.error("GeminiService.generateCode error:", error);
      throw error;
    }
  }

  async generateImage(prompt: string, size: string, aspectRatio: string = "1:1") {
    try {
      const response = await this.ai.models.generateContent({
        model: MODELS.IMAGE,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize: size as any,
          }
        },
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return imageUrl;
    } catch (error) {
      console.error("GeminiService.generateImage error:", error);
      throw error;
    }
  }

  async generateVideo(prompt: string, imageBase64?: string, aspectRatio: '16:9' | '9:16' = '16:9') {
    try {
      const config: any = {
        model: MODELS.VIDEO,
        prompt: prompt || 'Animate the scene beautifully.',
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio
        }
      };

      if (imageBase64) {
        config.image = {
          imageBytes: imageBase64.split(',')[1],
          mimeType: 'image/png'
        };
      }

      let operation = await this.ai.models.generateVideos(config);

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await this.ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const finalResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await finalResponse.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("GeminiService.generateVideo error:", error);
      throw error;
    }
  }
}
