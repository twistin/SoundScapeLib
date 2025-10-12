import React, { useState, useRef, useEffect } from 'react';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import RewindIcon from './icons/RewindIcon';
import FastForwardIcon from './icons/FastForwardIcon';

interface SoundscapePlayerProps {
  audioUrl: string;
}

const SoundscapePlayer: React.FC<SoundscapePlayerProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
        if (isPlaying) {
            audio.play().catch(error => console.error("Error playing audio:", error));
        } else {
            audio.pause();
        }
    }
  }, [isPlaying]);

  useEffect(() => {
    // Reset player when audioUrl changes
    const audio = audioRef.current;
    if (audio) {
        setIsPlaying(false);
        audio.currentTime = 0;
        setCurrentTime(0);
    }
  }, [audioUrl]);

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current && progressBarRef.current) {
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);
      const value = (newTime / audioRef.current.duration) * 100;
      progressBarRef.current.style.background = `linear-gradient(to right, #22d3ee ${value}%, #475569 ${value}%)`;
    }
  };
  
  const onEnded = () => {
      setIsPlaying(false);
  }

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = Number(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const seekRelative = (seconds: number) => {
     if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + seconds));
     }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md border border-slate-700">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      ></audio>
      
      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs text-slate-400 font-mono w-12 text-center">{formatTime(currentTime)}</span>
        <input
          ref={progressBarRef}
          type="range"
          value={currentTime}
          step="any"
          max={duration || 0}
          onInput={handleSeek}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          style={{ background: 'linear-gradient(to right, #22d3ee 0%, #475569 0%)' }}
        />
        <span className="text-xs text-slate-400 font-mono w-12 text-center">{formatTime(duration)}</span>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button onClick={() => seekRelative(-10)} className="text-slate-300 hover:text-white transition-colors">
          <RewindIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={togglePlayPause} 
          className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-full p-3 transition-colors shadow-lg flex items-center justify-center w-14 h-14"
        >
          {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
        </button>
         <button onClick={() => seekRelative(10)} className="text-slate-300 hover:text-white transition-colors">
          <FastForwardIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default SoundscapePlayer;
