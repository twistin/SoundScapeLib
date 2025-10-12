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
      className="bg-slate-800 rounded-lg p-6 shadow-lg cursor-pointer group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out flex flex-col items-start"
      onClick={() => onSelect(project.name)}
    >
        <div className="flex justify-between items-start w-full mb-4">
            <FolderIcon className="w-12 h-12 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
            {project.owner && (
                 <img 
                    src={project.owner.avatarUrl} 
                    alt={project.owner.name} 
                    title={`Owner: ${project.owner.name}`}
                    className="w-10 h-10 rounded-full border-2 border-slate-600 group-hover:border-cyan-400 transition-colors"
                />
            )}
        </div>
      <h3 className="text-xl font-bold text-white mb-1 truncate w-full" title={project.name}>{project.name}</h3>
      <p className="text-sm text-slate-400">{project.count} {project.count === 1 ? 'item' : 'items'}</p>
    </div>
  );
};

export default ProjectCard;