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

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="mb-3">
    <p className="text-sm font-semibold text-cyan-400">{label}</p>
    <p className="text-slate-300">{value}</p>
  </div>
);

const SessionDetail: React.FC<SessionDetailProps> = ({ session, onBack, onEdit, onDelete, gallerySource, onFileUpload, onFileDelete }) => {
  
  let backButtonText = 'Back to Project Gallery';
  if (gallerySource === 'recents') backButtonText = 'Back to Recents';
  if (gallerySource === 'map') backButtonText = 'Back to Map';


  return (
    <div className="animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        {backButtonText}
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/5">
          <img 
            src={session.imageUrl} 
            alt={session.title} 
            className="w-full h-auto object-cover rounded-lg shadow-2xl mb-8"
          />
          <div className="h-64 md:h-80 rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700">
             <MapComponent 
                center={[session.location.lat, session.location.lng]}
                zoom={12}
                singleMarkerPosition={[session.location.lat, session.location.lng]}
             />
          </div>
        </div>
        <div className="lg:w-2/5 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-extrabold text-white mb-2">{session.title}</h2>
              <p className="text-lg text-slate-400 mb-4">by {session.author}</p>
            </div>
            <div className="flex gap-3 mt-2 flex-shrink-0">
              <button onClick={() => onEdit(session)} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                <EditIcon className="w-6 h-6" />
              </button>
              <button onClick={() => onDelete(session.id)} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-red-500 transition-colors">
                <TrashIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <p className="text-slate-300 mb-6 leading-relaxed">{session.description}</p>
          
          <div className="bg-slate-800/50 p-4 rounded-lg mb-6 border border-slate-700">
            <DetailItem label="Project" value={session.project} />
            <DetailItem label="Location" value={session.location.name} />
            <DetailItem label="Date Recorded" value={session.date} />
            <DetailItem label="Sound Type" value={session.soundType} />
            <DetailItem label="Equipment Used" value={session.equipment} />
          </div>

          <FileManager 
            attachments={session.attachments}
            onFileUpload={onFileUpload}
            onFileDelete={onFileDelete}
          />

          <div className="mt-auto pt-6">
            <SoundscapePlayer audioUrl={session.audioUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;