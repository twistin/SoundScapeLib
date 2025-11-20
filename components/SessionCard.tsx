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
      className="glass-card relative rounded-xl overflow-hidden cursor-pointer group h-full flex flex-col"
      onClick={() => onSelect(session)}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
          <img 
            src={session.imageUrl} 
            alt={session.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 transition-opacity duration-300" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-4 shadow-2xl group-hover:bg-cyan-500 group-hover:border-cyan-400 transition-colors">
                <PlayIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          {onManageFiles && (
            <button 
            onClick={(e) => {
                e.stopPropagation();
                onManageFiles(session);
            }}
            className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0"
            title="Manage files"
            >
            <SettingsIcon className="w-4 h-4" />
            </button>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
             <div className="flex justify-between items-start mb-1">
                 <h3 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors">{session.title}</h3>
             </div>
            <p className="text-xs text-cyan-500 font-medium uppercase tracking-wide mb-2">{session.soundType}</p>
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{session.description}</p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
            <span>{session.date}</span>
            <span className="flex items-center gap-1">
                {session.duration ? `${Math.floor(session.duration / 60)}:${(session.duration % 60).toString().padStart(2, '0')}` : '00:00'}
            </span>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;