
export enum AppView {
  CHAT = 'CHAT',
  BUILDER = 'BUILDER',
  MEDIA_LAB = 'MEDIA_LAB',
  VOICE_STUDIO = 'VOICE_STUDIO'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isSearch?: boolean;
  groundingSources?: Array<{ uri: string; title: string }>;
}

export interface GeneratedMedia {
  type: 'image' | 'video';
  url: string;
  prompt: string;
  id: string;
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
