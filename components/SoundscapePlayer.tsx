
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
  const [error, setError] = useState<string | null>(null);
  
  // Determine if the URL is a local blob (uploaded file)
  const isLocalBlob = audioUrl.startsWith('blob:');
  
  // State to manage CORS. We try 'anonymous' first to support visualizers/analysis.
  // If it fails, we fallback to undefined to ensure playback works (opaque response).
  const [corsMode, setCorsMode] = useState<'anonymous' | undefined>(!isLocalBlob ? 'anonymous' : undefined);
  // Key helps force re-render of audio element when CORS mode changes
  const [playerKey, setPlayerKey] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
        if (isPlaying) {
            // Check if source is valid
            if (!audio.currentSrc && !audio.src) {
                console.warn("No audio source available");
                setError("No audio source provided");
                setIsPlaying(false);
                return;
            }

            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setError(null);
                    })
                    .catch(err => {
                        console.error("Error playing audio:", err);
                        setIsPlaying(false);
                        // Don't show alert for AbortError
                        if (err.name !== 'AbortError') {
                             // The onError handler on the audio tag will catch the real loading errors
                             // but explicit play failures might happen here.
                        }
                    });
            }
        } else {
            audio.pause();
        }
    }
  }, [isPlaying, audioUrl, playerKey]);

  useEffect(() => {
    // Reset player when audioUrl changes
    setIsPlaying(false);
    setCurrentTime(0);
    setError(null);
    // Reset CORS mode for new non-local files
    if (!audioUrl.startsWith('blob:')) {
        setCorsMode('anonymous');
    } else {
        setCorsMode(undefined);
    }
    setPlayerKey(prev => prev + 1);
  }, [audioUrl]);

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      const d = audioRef.current.duration;
      if(isFinite(d)) {
          setDuration(d);
          setError(null);
      }
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current && progressBarRef.current) {
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);
      
      if (audioRef.current.duration) {
          const value = (newTime / audioRef.current.duration) * 100;
          if (progressBarRef.current) {
            progressBarRef.current.style.background = `linear-gradient(to right, #22d3ee ${value}%, #475569 ${value}%)`;
          }
      }
    }
  };
  
  const onEnded = () => {
      setIsPlaying(false);
  }
  
  const onError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      const err = e.currentTarget.error;
      const src = e.currentTarget.src;
      console.error("Audio element error:", err, "Code:", err?.code, "Src:", src);

      // Auto-retry strategy for CORS issues (Error Code 4 often masks CORS blocks)
      // If we fail with 'anonymous', try without it.
      if (corsMode === 'anonymous' && !isLocalBlob) {
          console.log("Playback failed with CORS. Retrying without CORS headers...");
          setCorsMode(undefined);
          setPlayerKey(prev => prev + 1); // Force remount of audio tag
          return;
      }
      
      let msg = "Error loading audio file.";
      if (err) {
          if (err.code === 1) msg = "Aborted fetching audio.";
          if (err.code === 2) msg = "Network error loading audio.";
          if (err.code === 3) msg = "Audio decoding failed.";
          if (err.code === 4) msg = "Audio format not supported or access denied (CORS).";
      }
      setError(msg);
      setIsPlaying(false);
  }

  const togglePlayPause = () => {
    if (error && error !== "Playback failed.") return; 
    setIsPlaying(prev => !prev);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = Number(e.target.value);
      if (isFinite(newTime)) {
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
      }
    }
  };
  
  const seekRelative = (seconds: number) => {
     if (audioRef.current) {
        const newTime = audioRef.current.currentTime + seconds;
        if (isFinite(newTime) && isFinite(audioRef.current.duration)) {
            audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, newTime));
        }
     }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0 || !isFinite(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md border border-slate-700">
      <audio 
        key={playerKey}
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin={corsMode}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onError={onError}
      ></audio>
      
      {error && (
          <div className="text-red-400 text-xs mb-2 text-center bg-red-400/10 p-1 rounded border border-red-400/20">
              {error}
          </div>
      )}
      
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
          disabled={!!error}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(to right, #22d3ee 0%, #475569 0%)' }}
        />
        <span className="text-xs text-slate-400 font-mono w-12 text-center">{formatTime(duration)}</span>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button onClick={() => seekRelative(-10)} disabled={!!error} className="text-slate-300 hover:text-white transition-colors disabled:opacity-30">
          <RewindIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={togglePlayPause} 
          disabled={!!error && error !== "Playback failed."}
          className={`bg-cyan-500 hover:bg-cyan-400 text-white rounded-full p-3 transition-colors shadow-lg flex items-center justify-center w-14 h-14 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
        </button>
         <button onClick={() => seekRelative(10)} disabled={!!error} className="text-slate-300 hover:text-white transition-colors disabled:opacity-30">
          <FastForwardIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default SoundscapePlayer;
