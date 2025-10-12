import React from 'react';
import FolderIcon from './icons/FolderIcon';

const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg flex flex-col items-center text-center animate-pulse">
      <div className="w-20 h-20 bg-slate-700 rounded-lg mb-4 flex items-center justify-center">
        <FolderIcon className="w-12 h-12 text-slate-600" />
      </div>
      <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
    </div>
  );
};

export default ProjectCardSkeleton;
