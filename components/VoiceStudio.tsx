
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ICONS, MODELS } from '../constants';

const VoiceStudio: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'LISTENING'>('IDLE');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // PCM Helpers
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const startSession = async () => {
    setStatus('CONNECTING');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = ai.live.connect({
        model: MODELS.LIVE,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: 'You are a helpful and energetic voice assistant. Keep responses human-like and conversational.',
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setStatus('LISTENING');
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };
              
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.outputTranscription) {
              setTranscriptionHistory(prev => [...prev, `AI: ${message.serverContent!.outputTranscription!.text}`]);
            } else if (message.serverContent?.inputTranscription) {
              setTranscriptionHistory(prev => [...prev, `You: ${message.serverContent!.inputTranscription!.text}`]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live Error", e),
          onclose: () => stopSession()
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('IDLE');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('IDLE');
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    sessionRef.current = null;
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto space-y-6">
      <div className="flex-1 bg-gray-900 rounded-3xl border border-gray-800 p-8 flex flex-col items-center justify-between shadow-2xl">
        <div className="w-full text-center">
          <h2 className="text-2xl font-bold">Live Conversational Voice</h2>
          <p className="text-gray-400 mt-2">Zero-latency interaction with Gemini 2.5 Flash</p>
        </div>

        <div className="relative flex items-center justify-center">
          {/* Animated Circles */}
          <div className={`absolute w-64 h-64 rounded-full border-2 border-blue-500/20 transition-all duration-1000 ${isActive ? 'scale-150 opacity-0 animate-ping' : 'scale-100 opacity-20'}`}></div>
          <div className={`absolute w-48 h-48 rounded-full border-2 border-purple-500/20 transition-all duration-1000 ${isActive ? 'scale-125 opacity-0 animate-ping delay-300' : 'scale-100 opacity-10'}`}></div>
          
          <button
            onClick={isActive ? stopSession : startSession}
            disabled={status === 'CONNECTING'}
            className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
              isActive 
                ? 'bg-red-500 hover:bg-red-400 scale-110' 
                : 'bg-blue-600 hover:bg-blue-500 hover:scale-105'
            }`}
          >
            {status === 'CONNECTING' ? (
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : isActive ? (
              <div className="w-8 h-8 bg-white rounded-sm"></div>
            ) : (
              <div className="text-white scale-150"><ICONS.Voice /></div>
            )}
          </button>
        </div>

        <div className="w-full">
           <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full bg-blue-400 transition-all duration-150 ${
                    isActive ? 'h-8 animate-pulse' : 'h-2'
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
           </div>
           <p className="text-center font-medium text-gray-300">
             {status === 'IDLE' ? 'Tap to start conversation' : status === 'CONNECTING' ? 'Initializing session...' : 'I\'m listening...'}
           </p>
        </div>
      </div>

      <div className="h-48 bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Live Transcription</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
          {transcriptionHistory.length === 0 ? (
            <p className="text-gray-600 italic">No activity yet...</p>
          ) : (
            transcriptionHistory.map((t, i) => (
              <p key={i} className={t.startsWith('You:') ? 'text-blue-400' : 'text-purple-400'}>{t}</p>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceStudio;
