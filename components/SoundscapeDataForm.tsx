import React, { useState, useEffect } from 'react';
import { SoundscapeSession } from '../types';
import { uploadFile } from '../services/storage';

// The data structure the form will manage and submit
export interface SessionFormData {
  title: string;
  author: string;
  project: string;
  description: string;
  locationName: string;
  locationLat?: number;
  locationLng?: number;
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

const SoundscapeDataForm: React.FC<SoundscapeDataFormProps> = ({
  onSubmit,
  onCancel,
  initialDataFromAI,
  projects,
  isEditing,
  defaultProject
}) => {
  const [formData, setFormData] = useState<SessionFormData>({
    title: '',
    author: '',
    project: defaultProject || '',
    description: '',
    locationName: '',
    locationLat: undefined,
    locationLng: undefined,
    imageUrl: '',
    audioUrl: '',
    equipment: '',
    soundType: '',
    date: new Date().toISOString().split('T')[0],
    imageFile: undefined,
    audioFile: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDataFromAI) {
      setFormData(prev => ({
        ...prev,
        ...initialDataFromAI,
        project: initialDataFromAI.project || defaultProject || prev.project
      }));
    }
  }, [initialDataFromAI, defaultProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    let audioUrl = formData.audioUrl;
    let imageUrl = formData.imageUrl;

    try {
      if (formData.audioFile) {
        try {
          const { url } = await uploadFile(
            formData.audioFile,
            `uploads/audio/${Date.now()}-${formData.audioFile.name}`,
            { kind: 'audio' }
          );
          audioUrl = url;
        } catch (err) {
          console.warn('Audio upload failed, using local preview URL', err);
          if (!audioUrl) {
            audioUrl = URL.createObjectURL(formData.audioFile);
          }
          setSubmitError('No se pudo subir el audio a Storage; se usará la URL local.');
        }
      }

      if (formData.imageFile) {
        try {
          const { url } = await uploadFile(
            formData.imageFile,
            `uploads/images/${Date.now()}-${formData.imageFile.name}`,
            { kind: 'image' }
          );
          imageUrl = url;
        } catch (err) {
          console.warn('Image upload failed, using local preview URL', err);
          if (!imageUrl) {
            imageUrl = URL.createObjectURL(formData.imageFile);
          }
          setSubmitError('No se pudo subir la imagen a Storage; se usará la URL local.');
        }
      }

      onSubmit({
        ...formData,
        audioUrl,
        imageUrl,
      });
    } catch (err) {
      console.error('Submit error', err);
      setSubmitError('No se pudo guardar el soundscape. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof SessionFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        {isEditing ? 'Editar Soundscape' : 'Nuevo Soundscape'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <div className="p-3 rounded-md bg-red-900/40 border border-red-800 text-red-200 text-sm">
            {submitError}
          </div>
        )}

        {/* Título y Autor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📝 Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Título del soundscape"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              👤 Autor
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del autor"
              required
            />
          </div>
        </div>

        {/* Proyecto */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📁 Proyecto
          </label>
          <select
            value={formData.project}
            onChange={(e) => handleChange('project', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar proyecto</option>
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📖 Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción detallada del soundscape"
            required
          />
        </div>

        {/* Ubicación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📍 Ubicación
            </label>
            <input
              type="text"
              value={formData.locationName}
              onChange={(e) => handleChange('locationName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Bosque de La Granja"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🌐 Latitud
            </label>
            <input
              type="number"
              step="any"
              value={formData.locationLat || ''}
              onChange={(e) => handleChange('locationLat', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="40.4168"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🌐 Longitud
            </label>
            <input
              type="number"
              step="any"
              value={formData.locationLng || ''}
              onChange={(e) => handleChange('locationLng', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="-3.7038"
            />
          </div>
        </div>

        {/* Tipo de Sonido y Equipamiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🎵 Tipo de Sonido
            </label>
            <select
              value={formData.soundType}
              onChange={(e) => handleChange('soundType', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="Forest">🌲 Bosque</option>
              <option value="Urban">🏙️ Urbano</option>
              <option value="Marine">🌊 Marino</option>
              <option value="Desert">🏜️ Desierto</option>
              <option value="Industrial">🏭 Industrial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🎙️ Equipamiento
            </label>
            <input
              type="text"
              value={formData.equipment}
              onChange={(e) => handleChange('equipment', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Zoom H5, Audio-Technica AT875R"
            />
          </div>
        </div>

        {/* URLs y Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              🎵 Audio URL <span className="text-slate-500 font-normal">(opcional; se autocompleta si subes archivo)</span>
            </label>
            <input
              type="text"
              value={formData.audioUrl}
              onChange={(e) => handleChange('audioUrl', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Se completará con la subida a Storage o deja vacío"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              📷 Imagen URL <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Se completará con la subida a Storage o deja vacío"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📅 Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
          >
            {isSubmitting ? 'Subiendo...' : `💾 ${isEditing ? 'Actualizar' : 'Guardar'} Soundscape`}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SoundscapeDataForm;
