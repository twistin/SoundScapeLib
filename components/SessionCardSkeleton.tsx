import React from 'react';

const SessionCardSkeleton: React.FC = () => {
  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg bg-slate-800 animate-pulse">
      <div className="w-full h-64 bg-slate-700"></div>
      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default SessionCardSkeleton;
