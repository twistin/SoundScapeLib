
import React, { useState, useEffect } from 'react';
import Map from './Map';
import AudioRecorder from './AudioRecorder';
import { WeatherInfo, SoundscapeSession, User } from '../types';
import { getMockWeather } from '../utils/weatherUtils';
import { GoogleGenAI, Type } from '@google/genai';
import LoadingWaveIcon from './icons/LoadingWaveIcon';
import MagicWandIcon from './icons/MagicWandIcon';
import { uploadFile } from '../services/storage';
import { saveSessionToDb } from '../services/db';

interface FieldModeProps {
  onSaveSession: (session: SoundscapeSession) => void; // Keeping for local UI update compatibility if needed
  onCancel: () => void;
  currentUser: User;
  projects: string[];
}

type FieldStep = 'locate' | 'record' | 'details' | 'saving';

const FieldMode: React.FC<FieldModeProps> = ({ onSaveSession, onCancel, currentUser, projects }) => {
  const [step, setStep] = useState<FieldStep>('locate');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form Data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState(projects[0] || '');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [tags, setTags] = useState<{ biotic: string[], geophonic: string[], anthropophonic: string[] }>({
    biotic: [], geophonic: [], anthropophonic: []
  });
  const [geoError, setGeoError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 1. Acquire Location on Mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      const geoId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          if (!weather) {
             setWeather(getMockWeather(latitude, longitude));
          }
          setGeoError(null);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setGeoError(err.message);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
      
      return () => navigator.geolocation.clearWatch(geoId);
    } else {
        setGeoError("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setAudioBlob(blob);
    setAudioDuration(duration);
    const now = new Date();
    setTitle(`Field Recording ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setStep('details');
    processAI(blob); // Local AI preview, cloud will refine it later
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const processAI = async (audioBlob: Blob) => {
    if (!location) return;
    setAiProcessing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const weatherDesc = weather ? `${weather.condition}, ${weather.temperature}°C` : 'Unknown weather';
        const prompt = `Generate metadata for soundscape at ${location.lat},${location.lng}. Weather: ${weatherDesc}. JSON with title, description, tags (biotic, geophonic, anthropophonic).`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                tags: {
                    type: Type.OBJECT,
                    properties: {
                        biotic: { type: Type.ARRAY, items: { type: Type.STRING } },
                        geophonic: { type: Type.ARRAY, items: { type: Type.STRING } },
                        anthropophonic: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['biotic', 'geophonic', 'anthropophonic']
                }
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: schema }
        });

        const data = JSON.parse(response.text);
        if (data) {
            setTitle(data.title);
            setDescription(data.description);
            if (data.tags) setTags(data.tags);
        }
    } catch (e) {
        console.error("AI Processing failed", e);
    } finally {
        setAiProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!location || !audioBlob) return;
    setStep('saving');
    setSaveError(null);

    try {
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `field_rec_${Date.now()}.wav`;
        
        // 1. Upload Audio to Firebase Storage
        // Metadata attached here triggers the Cloud Function 'generateMetadataFromAudio'
        const audioUpload = await uploadFile(audioBlob, `uploads/${currentUser.id}/${filename}`, {
            lat: location.lat,
            lng: location.lng,
            projectId: selectedProject
        });

        // 2. Upload Image if exists
        let imageUrl = 'https://picsum.photos/seed/field/800/600';
        if (imageFile) {
             const imageUpload = await uploadFile(imageFile, `uploads/${currentUser.id}/img_${Date.now()}.jpg`);
             imageUrl = imageUpload.url;
        }

        // 3. Save Session to Firestore (Initial State)
        const newSession: SoundscapeSession = {
            id: '', // ID generated by db service
            title: title,
            author: currentUser.name,
            project: selectedProject,
            description: description,
            location: {
                name: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
                lat: location.lat,
                lng: location.lng
            },
            imageUrl: imageUrl,
            audioUrl: audioUpload.url,
            equipment: 'Mobile Recorder',
            soundType: 'Forest',
            date: dateStr,
            attachments: [],
            weather: weather || undefined,
            tags: tags,
            privacy: 'private',
            duration: audioDuration,
            aiStatus: 'PENDING' // IMPORTANT: Signals the UI that AI is processing
        };

        await saveSessionToDb(newSession);
        
        onSaveSession(newSession); // Update local mock state for immediate feedback if needed
        onCancel(); // Close modal

    } catch (error: any) {
        console.error("Save failed:", error);
        setSaveError("Failed to upload session. Please try again. " + error.message);
        setStep('details');
    }
  };

  const inputClass = "w-full bg-slate-800/80 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all";
  const labelClass = "block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2";

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col animate-fade-in overflow-y-auto font-sans">
         {/* Header */}
         <div className="flex justify-between items-center p-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h2 className="text-xl font-bold text-white tracking-wide">FIELD<span className="text-cyan-400">MODE</span></h2>
            </div>
            <button onClick={onCancel} className="text-sm text-slate-400 hover:text-white uppercase border border-slate-700 rounded px-4 py-2">Exit</button>
        </div>

        <div className="flex-grow p-6 flex flex-col items-center max-w-2xl mx-auto w-full">
            
            {step === 'locate' && (
                 <div className="w-full flex flex-col gap-6 animate-slide-up">
                    {/* Map and Weather UI */}
                    <div className="h-80 w-full bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 relative shadow-2xl">
                         {location && <Map center={[location.lat, location.lng]} zoom={15} singleMarkerPosition={[location.lat, location.lng]} showUserLocation={true} />}
                         {!location && <div className="p-10 text-center text-slate-500">Locating... {geoError}</div>}
                    </div>
                     <button onClick={() => setStep('record')} disabled={!location} className="w-full bg-cyan-600 text-white font-bold py-5 rounded-2xl">Initialize Recorder</button>
                 </div>
            )}

            {step === 'record' && (
                 <div className="w-full flex flex-col items-center">
                     <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                     <button onClick={() => setStep('locate')} className="mt-8 text-slate-500">Cancel</button>
                 </div>
            )}

            {step === 'details' && (
                <div className="w-full space-y-8 animate-slide-up pb-10">
                    {saveError && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">{saveError}</div>}
                    <div className="space-y-6">
                        <div><label className={labelClass}>Title</label><input value={title} onChange={e => setTitle(e.target.value)} className={inputClass}/></div>
                        <div><label className={labelClass}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} min-h-[100px]`}/></div>
                        <button onClick={handleSave} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-5 rounded-2xl shadow-lg text-lg">
                            Save to Cloud Library
                        </button>
                    </div>
                </div>
            )}

             {step === 'saving' && (
                 <div className="flex-grow flex flex-col items-center justify-center animate-fade-in">
                     <LoadingWaveIcon className="w-24 h-24 text-cyan-400 mb-6" />
                     <h3 className="text-3xl font-bold text-white mb-2">Syncing Data...</h3>
                     <p className="text-slate-400">Uploading to secure cloud storage</p>
                 </div>
             )}
        </div>
    </div>
  );
};

export default FieldMode;
