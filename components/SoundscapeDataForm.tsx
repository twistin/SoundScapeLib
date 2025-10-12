import React, { useState, useEffect } from 'react';
import { SoundscapeSession } from '../types';

// The data structure the form will manage and submit
export interface SessionFormData {
  title: string;
  author: string;
  project: string;
  description: string;
  locationName: string;
  imageUrl: string;
  audioUrl: string;
  equipment: string;
  soundType: string;
  date: string;
  imageFile?: File;
  audioFile?: File;
}

interface SoundscapeDataFormProps {
  onSubmit: (sessionData: SessionFormData) => void;
  onCancel: () => void;
  initialDataFromAI?: SessionFormData | null;
  projects: string[];
  isEditing: boolean;
  defaultProject?: string | null;
}

const SoundscapeDataForm: React.FC<SoundscapeDataFormProps> = ({ onSubmit, onCancel, initialDataFromAI, projects, isEditing, defaultProject }) => {
  const [formData, setFormData] = useState<SessionFormData>({
    title: '',
    author: '',
    project: defaultProject || '',
    description: '',
    locationName: '',
    imageUrl: '',
    audioUrl: '',
    equipment: '',
    soundType: 'Forest',
    date: new Date().toISOString().split('T')[0],
  });
  
  // State for previewing files
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);

  useEffect(() => {
    if (initialDataFromAI) {
      // If a default project is passed, it takes precedence over AI-generated project
      setFormData({
        ...initialDataFromAI,
        project: defaultProject || initialDataFromAI.project,
      });

      if(initialDataFromAI.imageFile) {
        setImagePreview(URL.createObjectURL(initialDataFromAI.imageFile));
      } else if (initialDataFromAI.imageUrl) {
        setImagePreview(initialDataFromAI.imageUrl);
      }
      
      if(initialDataFromAI.audioFile) {
        setAudioFileName(initialDataFromAI.audioFile.name);
      } else if (initialDataFromAI.audioUrl) {
         setAudioFileName(initialDataFromAI.audioUrl.split('/').pop() || 'Existing Audio');
      }
    }
    
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [initialDataFromAI, defaultProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      if (name === 'imageFile') {
        setFormData(prev => ({ ...prev, imageFile: file, imageUrl: file.name }));
        
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(URL.createObjectURL(file));

      } else if (name === 'audioFile') {
        setFormData(prev => ({ ...prev, audioFile: file, audioUrl: file.name }));
        setAudioFileName(file.name);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:bg-slate-700 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-slate-400 mb-1";
  const fileInputClass = "block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-400 transition-colors";


  return (
    <div className="max-w-3xl mx-auto animate-fade-in w-full">
        <h2 className="text-3xl font-bold text-white mb-6">{isEditing ? 'Edit Soundscape' : 'Review & Confirm Details'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title" className={labelClass}>Title</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className={inputClass} required />
                </div>
                 <div>
                    <label htmlFor="author" className={labelClass}>Author</label>
                    <input type="text" id="author" name="author" value={formData.author} onChange={handleChange} className={inputClass} required />
                </div>
            </div>
             <div>
                <label htmlFor="project" className={labelClass}>Project</label>
                <input 
                    type="text" 
                    id="project" 
                    name="project" 
                    list="project-list" 
                    value={formData.project} 
                    onChange={handleChange} 
                    className={inputClass} 
                    required 
                    placeholder="e.g., Nature Field Recordings"
                    disabled={!!defaultProject}
                    readOnly={!!defaultProject}
                />
                <datalist id="project-list">
                    {projects.map(p => <option key={p} value={p} />)}
                </datalist>
            </div>
            <div>
                <label htmlFor="description" className={labelClass}>Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={inputClass} rows={4} required />
            </div>
            <div>
                <label htmlFor="locationName" className={labelClass}>Location Name</label>
                <input type="text" id="locationName" name="locationName" value={formData.locationName} onChange={handleChange} className={inputClass} required />
            </div>
            
            <div>
              <label htmlFor="imageFile" className={labelClass}>Image</label>
              <input type="file" id="imageFile" name="imageFile" onChange={handleFileChange} className={fileInputClass} accept="image/*" />
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-2">Image Preview:</p>
                  <img src={imagePreview} alt="Selected preview" className="rounded-lg max-h-48 w-auto object-cover"/>
                </div>
              )}
            </div>
            
            <div>
                <label htmlFor="audioFile" className={labelClass}>Audio</label>
                <input type="file" id="audioFile" name="audioFile" onChange={handleFileChange} className={fileInputClass} accept="audio/*" />
                {audioFileName && (
                  <p className="text-sm text-slate-400 mt-2">Selected audio: <span className="font-medium text-slate-300">{audioFileName}</span></p>
                )}
            </div>

             <div>
                <label htmlFor="equipment" className={labelClass}>Equipment Used</label>
                <input type="text" id="equipment" name="equipment" value={formData.equipment} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="soundType" className={labelClass}>Sound Type</label>
                    <select id="soundType" name="soundType" value={formData.soundType} onChange={handleChange} className={inputClass} required>
                        <option>Forest</option>
                        <option>Urban</option>
                        <option>Marine</option>
                        <option>Desert</option>
                        <option>Industrial</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="date" className={labelClass}>Date Recorded</label>
                    <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} required />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Cancel
                </button>
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    {isEditing ? 'Save Changes' : 'Create Soundscape'}
                </button>
            </div>
        </form>
    </div>
  );
};

export default SoundscapeDataForm;