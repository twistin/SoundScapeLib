import React, { useState, useEffect, useMemo } from 'react';
import { SoundscapeSession } from '../types';
import { SessionFormData } from './SoundscapeDataForm';
import SoundscapeDataForm from './SoundscapeDataForm';
import LoadingWaveIcon from './icons/LoadingWaveIcon';
import MagicWandIcon from './icons/MagicWandIcon';

interface SessionFormProps {
  onSubmit: (sessionData: SessionFormData) => void;
  onCancel: () => void;
  initialData?: SoundscapeSession | null;
  projects: string[];
  defaultProject?: string | null;
}

type WizardStep = 'upload' | 'prompt' | 'generating' | 'confirm';

const generatingMessages = [
  'Analyzing sound profile...',
  'Generating creative titles...',
  'Identifying acoustic environment...',
  'Suggesting technical gear...',
  'Crafting a vivid description...',
];

const AI_ENDPOINT = import.meta.env.VITE_AI_API_URL || 'http://localhost:8080/api/v1/ai/generate-metadata';

const inferSoundType = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.match(/forest|birds|tree|river|rain|wind/i)) return 'Forest';
  if (lower.match(/city|traffic|metro|street|urban/i)) return 'Urban';
  if (lower.match(/sea|ocean|waves|harbor|coast/i)) return 'Marine';
  if (lower.match(/desert|sand|dune|dry/i)) return 'Desert';
  if (lower.match(/factory|industrial|machine|engine/i)) return 'Industrial';
  return 'Urban';
};

const buildFallbackMetadata = (prompt: string, project?: string | null): SessionFormData => {
  const titleBase = prompt.slice(0, 60) || 'New Soundscape';
  return {
    title: `AI Generated: ${titleBase}`,
    author: '',
    project: project || 'Untitled Project',
    description: prompt,
    locationName: 'Unknown location',
    locationLat: undefined,
    locationLng: undefined,
    imageUrl: '',
    audioUrl: '',
    equipment: 'Field recorder with stereo mics',
    soundType: inferSoundType(prompt),
    date: new Date().toISOString().split('T')[0],
  };
};

const mapBackendResponse = (data: any, prompt: string, project?: string | null): SessionFormData => {
  const description = data?.description || prompt;
  const title = data?.title || `AI Generated: ${description.slice(0, 60)}`;
  const locationName = data?.locationName || data?.location_name || data?.location || 'Unknown location';
  const soundType = data?.soundType || data?.sound_type || inferSoundType(description);

  return {
    title,
    author: '',
    project: data?.project || project || 'Untitled Project',
    description,
    locationName,
    locationLat: data?.locationLat || data?.lat || undefined,
    locationLng: data?.locationLng || data?.lng || undefined,
    imageUrl: '',
    audioUrl: '',
    equipment: data?.equipment || 'Field recorder with stereo mics',
    soundType,
    date: new Date().toISOString().split('T')[0],
  };
};

const SessionForm: React.FC<SessionFormProps> = ({ onSubmit, onCancel, initialData, projects, defaultProject }) => {
  const [step, setStep] = useState<WizardStep>('upload');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [generatedData, setGeneratedData] = useState<SessionFormData | null>(null);

  useEffect(() => {
    if (initialData) {
      setGeneratedData({
        title: initialData.title,
        author: initialData.author,
        project: initialData.project,
        description: initialData.description,
        locationName: initialData.location.name,
        locationLat: initialData.location.lat,
        locationLng: initialData.location.lng,
        imageUrl: initialData.imageUrl,
        audioUrl: initialData.audioUrl,
        equipment: initialData.equipment,
        soundType: initialData.soundType,
        date: initialData.date,
      });
      setStep('confirm');
    }
  }, [initialData]);

  useEffect(() => {
    let interval: number;
    if (isGenerating) {
      interval = window.setInterval(() => {
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % generatingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'audio' | 'image') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (fileType === 'audio') setAudioFile(file);
      if (fileType === 'image') setImageFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      setError('Please provide a description of your soundscape.');
      return;
    }
    setError(null);
    setIsGenerating(true);
    setStep('generating');

    const prompt = userPrompt.trim();

    try {
      let aiMetadata: SessionFormData | null = null;

      try {
        const response = await fetch(AI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: prompt }),
        });

        if (response.ok) {
          const payload = await response.json();
          const data = payload?.data ?? payload;
          aiMetadata = mapBackendResponse(data, prompt, defaultProject);
        }
      } catch (fetchError) {
        console.warn('AI endpoint unavailable, falling back to local generation', fetchError);
      }

      const metadata = aiMetadata || buildFallbackMetadata(prompt, defaultProject);

      setGeneratedData({
        ...metadata,
        project: metadata.project || defaultProject || 'Untitled Project',
        audioFile: audioFile || undefined,
        audioUrl: audioFile?.name || metadata.audioUrl || '',
        imageFile: imageFile || undefined,
        imageUrl: imageFile?.name || metadata.imageUrl || '',
      });
      setStep('confirm');
    } catch (e) {
      console.error(e);
      setError('Failed to generate details. Please try again or fill the form manually.');
      setStep('prompt');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSkip = () => {
     setGeneratedData(null);
     setStep('confirm');
  }

  const FileInput = ({ label, file, onChange, accept }: { label: string; file: File | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; accept: string }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-600 px-6 py-10">
            <div className="text-center">
                 <svg className="mx-auto h-12 w-12 text-slate-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" /></svg>
                <div className="mt-4 flex text-sm leading-6 text-slate-400">
                    <label htmlFor={label} className="relative cursor-pointer rounded-md font-semibold text-cyan-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 hover:text-cyan-300">
                        <span>Upload a file</span>
                        <input id={label} name={label} type="file" className="sr-only" onChange={onChange} accept={accept} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                {file && <p className="text-sm text-slate-300 mt-2 truncate">{file.name}</p>}
            </div>
        </div>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
                { defaultProject ? `Add Soundscape to "${defaultProject}"` : 'Upload Your Soundscape'}
            </h2>
            <p className="text-slate-400 mb-8">Start by uploading your audio and an optional cover image.</p>
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <FileInput label="Audio File (Required)" file={audioFile} onChange={(e) => handleFileChange(e, 'audio')} accept="audio/*" />
              <FileInput label="Image File (Optional)" file={imageFile} onChange={(e) => handleFileChange(e, 'image')} accept="image/*" />
            </div>
            <div className="flex justify-end gap-4">
               <button type="button" onClick={onCancel} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
               <button onClick={() => setStep('prompt')} disabled={!audioFile} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        );
      case 'prompt':
        return (
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Describe Your Recording</h2>
            <p className="text-slate-400 mb-8">Give the AI some context. What does it sound like? Where was it recorded? The more detail, the better the result.</p>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g., 'A tranquil recording of a gentle creek flowing through a dense forest. Birds can be heard chirping in the background...'"
              className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition mb-4"
              rows={5}
            />
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button type="button" onClick={handleSkip} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">Skip & Fill Manually</button>
              <button onClick={handleGenerate} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2">
                <MagicWandIcon className="w-5 h-5"/>
                Generate with AI
              </button>
            </div>
          </div>
        );
      case 'generating':
        return (
          <div className="text-center">
            <LoadingWaveIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <p className="text-xl text-white transition-opacity duration-500">{generatingMessages[currentMessageIndex]}</p>
          </div>
        );
      case 'confirm':
        return <SoundscapeDataForm 
                    onSubmit={onSubmit} 
                    onCancel={onCancel} 
                    initialDataFromAI={generatedData} 
                    projects={projects} 
                    isEditing={!!initialData}
                    defaultProject={defaultProject}
                />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
        {renderContent()}
    </div>
  )
};

export default SessionForm;
