import React from 'react';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const backgroundImageUrl = 'https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className="relative min-h-screen text-white overflow-hidden animate-fade-in">
      {/* Layer 1: Background Image */}
      <div
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
      />
      
      {/* Layer 2: Dark Overlay */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 bg-opacity-70 z-10" />

      {/* Layer 3: Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
            Welcome to <span className="text-cyan-400">Soundscape</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-8 backdrop-blur-sm bg-black/20 py-2 px-4 rounded-md">
            Your personal library for immersive field recordings. Upload, organize, and explore audio from around the world.
          </p>
          <button
            onClick={onEnter}
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 ease-in-out transform hover:scale-105 inline-flex items-center gap-3 shadow-lg shadow-cyan-500/20"
          >
            Enter Library
            <ArrowRightIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="absolute bottom-4 text-slate-300 text-sm bg-black/30 px-3 py-1 rounded-full">
            <p>A portfolio project demonstrating React, TypeScript, and Tailwind CSS.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
