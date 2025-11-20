import React from 'react';
import PlusIcon from './icons/PlusIcon';

interface NewProjectCardProps {
  onClick: () => void;
}

const NewProjectCard: React.FC<NewProjectCardProps> = ({ onClick }) => {
  return (
    <div
      className="glass-card h-48 rounded-xl p-6 cursor-pointer group flex flex-col items-center justify-center text-center border border-dashed border-slate-700 hover:border-cyan-500 hover:bg-cyan-900/10 transition-all duration-300 relative overflow-hidden"
      onClick={onClick}
    >
       <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-cyan-500 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center mb-4 transition-all duration-300 z-10 relative group-hover:scale-110">
        <PlusIcon className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors z-10">Create New Project</h3>
    </div>
  );
};

export default NewProjectCard;