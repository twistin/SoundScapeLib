import React from 'react';
import { Project } from '../types';
import FolderIcon from './icons/FolderIcon';

interface ProjectCardProps {
  project: {
    name: string;
    count: number;
  } & Partial<Pick<Project, 'owner'>>;
  onSelect: (projectName: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  return (
    <div
      className="glass-card rounded-xl p-6 shadow-lg cursor-pointer group flex flex-col items-start justify-between h-48 relative overflow-hidden"
      onClick={() => onSelect(project.name)}
    >
        {/* Decorative background blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors duration-500"></div>

        <div className="flex justify-between items-start w-full z-10">
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 group-hover:border-cyan-500/50 group-hover:bg-cyan-900/20 transition-colors">
                 <FolderIcon className="w-8 h-8 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            {project.owner && (
                 <div className="relative">
                     <img 
                        src={project.owner.avatarUrl} 
                        alt={project.owner.name} 
                        title={`Owner: ${project.owner.name}`}
                        className="w-8 h-8 rounded-full border border-slate-600 group-hover:border-cyan-400 transition-colors shadow-sm"
                    />
                 </div>
            )}
        </div>
      
      <div className="w-full z-10">
        <h3 className="text-xl font-bold text-white mb-1 truncate w-full group-hover:text-cyan-400 transition-colors" title={project.name}>
            {project.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors"></span>
            {project.count} {project.count === 1 ? 'soundscape' : 'soundscapes'}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;