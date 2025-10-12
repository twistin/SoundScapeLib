
import React from 'react';
import { SoundscapeSession } from '../types';
import PlayIcon from './icons/PlayIcon';
import SettingsIcon from './icons/SettingsIcon';

interface SessionCardProps {
  session: SoundscapeSession;
  onSelect: (session: SoundscapeSession) => void;
  onManageFiles?: (session: SoundscapeSession) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onSelect, onManageFiles }) => {
  return (
    <div 
      className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out bg-slate-800"
      onClick={() => onSelect(session)}
    >
      <img 
        src={session.imageUrl} 
        alt={session.title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" 
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-70 transition-all duration-300 flex flex-col justify-end p-4">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-cyan-500 rounded-full p-4">
            <PlayIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white">{session.title}</h3>
        <p className="text-sm text-slate-300">{session.author}</p>
      </div>
      {onManageFiles && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onManageFiles(session);
          }}
          className="absolute top-2 right-2 p-2 bg-slate-800/60 hover:bg-slate-700/80 rounded-full text-slate-300 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
          title="Manage files"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SessionCard;