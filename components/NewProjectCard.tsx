import React from 'react';
import PlusIcon from './icons/PlusIcon';

interface NewProjectCardProps {
  onClick: () => void;
}

const NewProjectCard: React.FC<NewProjectCardProps> = ({ onClick }) => {
  return (
    <div
      className="bg-slate-800 rounded-lg p-6 shadow-lg cursor-pointer group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-700 hover:border-cyan-500 hover:bg-slate-700"
      onClick={onClick}
      style={{ minHeight: '188px' }}
    >
      <div className="w-16 h-16 rounded-full bg-slate-700 group-hover:bg-cyan-500 flex items-center justify-center mb-4 transition-colors">
        <PlusIcon className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-xl font-bold text-white">Add New Project</h3>
    </div>
  );
};

export default NewProjectCard;
