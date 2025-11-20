import React from 'react';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  // Updated to use the local image. 
  // IMPORTANT: Save the provided image as 'field-hero.jpg' in your public folder.
  const backgroundImageUrl = '/field-hero.jpg';

  return (
    <div className="relative min-h-screen text-white overflow-hidden animate-fade-in">
      {/* Layer 1: Background Image with Scale Animation */}
      <div
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0 animate-[pulse_20s_ease-in-out_infinite] transform scale-105"
      />
      
      {/* Layer 2: Rich Gradient Overlay - Adjusted for better visibility of the glitch art */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-slate-900/40 via-slate-900/70 to-slate-950 z-10" />

      {/* Layer 3: Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-4xl animate-slide-up">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold tracking-wider uppercase backdrop-blur-sm">
              eXperiment. eXplore. eXport.
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-400 drop-shadow-2xl">
            Sound<span className="text-cyan-400">X</span>cape
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
            The ultimate platform for capturing, designing, and exploring your audio universe.
          </p>
          
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center justify-center px-8 py-5 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 shadow-xl hover:shadow-cyan-500/30"
          >
            <div className="absolute transition-all duration-200 rounded-full -inset-px bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] group-hover:-inset-1"></div>
            <div className="relative inline-flex items-center gap-3">
                <span>Enter Studio</span>
                <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
        
        <div className="absolute bottom-8 flex gap-8 text-slate-400/70 text-sm font-medium tracking-widest uppercase backdrop-blur-sm py-2 px-4 rounded-full border border-white/5">
            <span>X-Capture</span> • <span>Pro Library</span> • <span>Design</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;