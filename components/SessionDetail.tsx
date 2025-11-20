import React from 'react';
import { SoundscapeSession } from '../types';
import SoundscapePlayer from './SoundscapePlayer';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import MapComponent from './Map';
import FileManager from './FileManager';


interface SessionDetailProps {
  session: SoundscapeSession;
  onBack: () => void;
  onEdit: (session: SoundscapeSession) => void;
  onDelete: (sessionId: string) => void;
  gallerySource: 'projects' | 'recents' | 'map';
  onFileUpload: (file: File) => void;
  onFileDelete: (attachmentId: string) => void;
}

const DetailItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-slate-200 font-medium text-lg">{value}</p>
        </div>
    );
};

const TagGroup: React.FC<{ label: string; tags: string[]; colorClass: string }> = ({ label, tags, colorClass }) => {
    if (!tags || tags.length === 0) return null;
    return (
        <div className="mb-4">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-2">{label}</span>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${colorClass} transition-transform hover:scale-105 cursor-default`}>
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}

const SessionDetail: React.FC<SessionDetailProps> = ({ session, onBack, onEdit, onDelete, gallerySource, onFileUpload, onFileDelete }) => {
  
  let backButtonText = 'Back to Project Gallery';
  if (gallerySource === 'recents') backButtonText = 'Back to Recents';
  if (gallerySource === 'map') backButtonText = 'Back to Map';

  return (
    <div className="animate-slide-up pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 mb-8 text-slate-400 hover:text-cyan-400 transition-colors duration-200 group font-medium"
      >
        <div className="p-2 rounded-full bg-slate-800 group-hover:bg-cyan-500/10 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
        </div>
        {backButtonText}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visuals */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
            <img 
                src={session.imageUrl} 
                alt={session.title} 
                className="w-full h-auto object-cover max-h-[600px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          <div className="h-80 rounded-2xl overflow-hidden shadow-xl border border-slate-700 relative">
             <div className="absolute top-3 left-3 z-[400] bg-slate-900/80 backdrop-blur px-3 py-1 rounded-md text-xs font-bold text-white border border-slate-600">
                LOCATION DATA
             </div>
             <MapComponent 
                center={[session.location.lat, session.location.lng]}
                zoom={13}
                singleMarkerPosition={[session.location.lat, session.location.lng]}
             />
          </div>
        </div>

        {/* Right Column: Info & Audio */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-8 rounded-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-white mb-2 leading-tight">{session.title}</h1>
                  <div className="flex items-center gap-2 text-slate-400">
                      <span className="w-6 h-[1px] bg-cyan-500"></span>
                      <p className="text-lg font-light">Recorded by {session.author}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(session)} className="p-2.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-white text-slate-400 transition-all">
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => onDelete(session.id)} className="p-2.5 rounded-lg bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 transition-all">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                 <span className={`text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide border ${
                     session.privacy === 'public' 
                     ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                     : 'bg-slate-700/50 text-slate-300 border-slate-600'
                 }`}>
                     {session.privacy || 'Private'}
                 </span>
                  {session.weather && (
                     <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-2">
                         <span>{session.weather.temperature}°C</span>
                         <span className="w-1 h-1 rounded-full bg-cyan-500"></span>
                         <span>{session.weather.condition}</span>
                     </span>
                 )}
              </div>

              <p className="text-slate-300 mb-8 leading-relaxed whitespace-pre-wrap text-lg font-light border-l-2 border-slate-700 pl-4">
                  {session.description}
              </p>

              {/* Audio Player Prominent */}
              <div className="mb-8">
                <SoundscapePlayer audioUrl={session.audioUrl} />
              </div>
          </div>
          
          {/* Metadata Grid */}
          <div className="glass-panel p-6 rounded-2xl grid grid-cols-2 gap-6">
            <DetailItem label="Project" value={session.project} />
            <DetailItem label="Location" value={session.location.name} />
            <DetailItem label="Date Recorded" value={session.date} />
            <DetailItem label="Sound Type" value={session.soundType} />
            <DetailItem label="Equipment" value={session.equipment} />
            {session.duration && <DetailItem label="Duration" value={`${Math.floor(session.duration / 60)}m ${session.duration % 60}s`} />}
          </div>
          
          {/* Tags Section */}
          {session.tags && (
             <div className="glass-panel p-6 rounded-2xl">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Ecological Tags</h3>
                 <TagGroup label="Biotic Elements" tags={session.tags.biotic} colorClass="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
                 <TagGroup label="Geophonic Elements" tags={session.tags.geophonic} colorClass="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
                 <TagGroup label="Anthropophonic Elements" tags={session.tags.anthropophonic} colorClass="bg-amber-500/10 text-amber-400 border-amber-500/20" />
             </div>
          )}

          <FileManager 
            attachments={session.attachments}
            onFileUpload={onFileUpload}
            onFileDelete={onFileDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;