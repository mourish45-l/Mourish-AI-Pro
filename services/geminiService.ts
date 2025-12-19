
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MODELS } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async chat(message: string, history: any[] = []) {
    const chatInstance = this.ai.chats.create({
      model: MODELS.CHAT,
      config: {
        systemInstruction: "You are an expert AI assistant. Provide helpful, accurate, and concise answers.",
      }
    });
    // This API expects history in specific format if we were doing true history, 
    // for simplicity we'll just send the current message.
    const response = await chatInstance.sendMessage({ message });
    return response;
  }

  async searchGrounding(query: string) {
    const response = await this.ai.models.generateContent({
      model: MODELS.SEARCH,
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response;
  }

  async generateCode(prompt: string) {
    const response = await this.ai.models.generateContent({
      model: MODELS.CHAT,
      contents: `Create a single-file web application based on this request: "${prompt}". 
      Return ONLY the complete HTML code including Tailwind CSS via CDN and any necessary JS. 
      Do not include markdown code blocks, just the raw code.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  }

  async generateImage(prompt: string, size: string, aspectRatio: string = "1:1") {
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
  }

  async generateVideo(prompt: string, imageBase64?: string, aspectRatio: '16:9' | '9:16' = '16:9') {
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
  }
}
