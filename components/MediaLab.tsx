
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ICONS } from '../constants';
import { ImageSize, AspectRatio } from '../types';

// The 'aistudio' property is already provided globally on the window object.
// Removed local 'declare global' block to resolve "identical modifiers" and "subsequent property declarations" errors.

const MediaLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [size, setSize] = useState<ImageSize>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generatedMedia, setGeneratedMedia] = useState<{url: string, type: 'image' | 'video'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const checkAndGenerate = async () => {
    if (!prompt.trim() && !uploadedImage) return;

    setLoading(true);
    try {
      // Accessing aistudio from the window object. Using 'as any' to bypass potential environment-specific type mismatches.
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Proceeding assuming success as per guidelines: "assume the key selection was successful after triggering openSelectKey()"
      }

      const gemini = new GeminiService(process.env.API_KEY!);
      
      if (mediaType === 'IMAGE') {
        const url = await gemini.generateImage(prompt, size, aspectRatio);
        setGeneratedMedia({ url, type: 'image' });
      } else {
        const url = await gemini.generateVideo(prompt, uploadedImage || undefined, aspectRatio as any);
        setGeneratedMedia({ url, type: 'video' });
      }
    } catch (error) {
      console.error(error);
      // Reset the key selection state if the request fails with the specified error message.
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setMediaType('VIDEO'); // Default to video if image uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Media Laboratory</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex bg-gray-800 p-1 rounded-lg">
              <button 
                onClick={() => setMediaType('IMAGE')}
                className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${mediaType === 'IMAGE' ? 'bg-gray-700 text-white shadow' : 'text-gray-400'}`}
              >
                Image Generation
              </button>
              <button 
                onClick={() => setMediaType('VIDEO')}
                className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${mediaType === 'VIDEO' ? 'bg-gray-700 text-white shadow' : 'text-gray-400'}`}
              >
                Veo Video
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mediaType === 'IMAGE' ? "A futuristic city under a neon sky..." : "Animate this scene with a cinematic tracking shot..."}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {mediaType === 'IMAGE' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quality</label>
                  <select 
                    value={size} 
                    onChange={(e) => setSize(e.target.value as ImageSize)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-sm focus:outline-none"
                  >
                    <option value="1K">Standard (1K)</option>
                    <option value="2K">High (2K)</option>
                    <option value="4K">Ultra (4K)</option>
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ratio</label>
                <select 
                  value={aspectRatio} 
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-sm focus:outline-none"
                >
                  <option value="1:1">1:1 Square</option>
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Portrait</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reference Image (Optional)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-950 hover:bg-gray-800 transition-colors overflow-hidden">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Reference" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              {uploadedImage && <button onClick={() => setUploadedImage(null)} className="text-xs text-red-400 hover:underline">Remove image</button>}
            </div>

            <button
              onClick={checkAndGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{mediaType === 'VIDEO' ? 'Generating Video (may take 2 mins)...' : 'Creating Masterpiece...'}</span>
                </>
              ) : (
                <>
                  {mediaType === 'IMAGE' ? <ICONS.Media /> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path></svg>}
                  <span>Generate {mediaType === 'IMAGE' ? 'Image' : 'Video'}</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center bg-gray-950 rounded-2xl border border-gray-800 relative min-h-[400px]">
            {!generatedMedia ? (
              <div className="text-center p-8 text-gray-600">
                <div className="mb-4 inline-block opacity-20"><ICONS.Media /></div>
                <p>Your creation will appear here.</p>
                <p className="text-xs mt-2">Gemini 3 Pro & Veo 3.1 Fast Powered</p>
              </div>
            ) : (
              <div className="w-full h-full p-2 flex flex-col space-y-2">
                <div className="flex-1 rounded-lg overflow-hidden flex items-center justify-center bg-black">
                  {generatedMedia.type === 'image' ? (
                    <img src={generatedMedia.url} alt="Generated" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <video src={generatedMedia.url} controls autoPlay loop className="max-w-full max-h-full" />
                  )}
                </div>
                <div className="flex justify-between items-center px-2">
                   <p className="text-xs text-gray-400 truncate max-w-[200px]">{prompt}</p>
                   <a 
                    href={generatedMedia.url} 
                    download={`aero-media-${Date.now()}`} 
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-blue-400 transition-colors"
                  >
                    <ICONS.Download />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-900/10 border border-blue-900/20 rounded-xl">
          <p className="text-xs text-blue-300">
            <strong>Pro Tip:</strong> Using an image as a starting point for Veo videos results in much higher consistency. Try generating an image first, then use it to create a video!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MediaLab;
