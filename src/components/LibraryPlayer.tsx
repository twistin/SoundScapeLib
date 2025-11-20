
import React, { useEffect, useRef, useState } from 'react';
import { AudioFile } from '../types';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import DragHandleIcon from './icons/DragHandleIcon';
import HardDriveIcon from './icons/HardDriveIcon';
import RewindIcon from './icons/RewindIcon';
import ActivityIcon from './icons/ActivityIcon';
import EditIcon from './icons/EditIcon';
import ScissorsIcon from './icons/ScissorsIcon';
import SparklesIcon from './icons/SparklesIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import AdjustmentsHorizontalIcon from './icons/AdjustmentsHorizontalIcon';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import DownloadIcon from './icons/DownloadIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import { getProcessedAudioUrl } from '../services/api';

// Declare Wavesurfer globally as it's imported via script tag
declare const WaveSurfer: any;

interface LibraryPlayerProps {
  file: AudioFile | null;
}

const LibraryPlayer: React.FC<LibraryPlayerProps> = ({ file }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const regionsPluginRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const largeCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  // FX Nodes
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const dryGainNodeRef = useRef<GainNode | null>(null);
  const wetGainNodeRef = useRef<GainNode | null>(null);

  const rafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFX, setShowFX] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState(false);
  
  // Processing State
  const [pitch, setPitch] = useState(0); // Semitones (simulated via speed)
  const [speed, setSpeed] = useState(1.0); // Rate
  const [isReverse, setIsReverse] = useState(false);
  const [preservePitch, setPreservePitch] = useState(false); // Time stretching vs Tape
  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);

  // Cloud Processing State
  const [isProcessingCloud, setIsProcessingCloud] = useState(false);
  const [includeHandles, setIncludeHandles] = useState(false);

  // FX State
  const [filterType, setFilterType] = useState<'lowpass' | 'highpass'>('lowpass');
  const [filterFreq, setFilterFreq] = useState(20000); // Default open
  const [reverbAmount, setReverbAmount] = useState(0); // 0-1

  // Analysis State
  const [loudness, setLoudness] = useState<number>(-60); // dB
  const [peak, setPeak] = useState<number>(0); // Linear 0-1

  useEffect(() => {
    if (containerRef.current && !wavesurferRef.current) {
      // Initialize Regions Plugin
      regionsPluginRef.current = WaveSurfer.Regions.create();

      wavesurferRef.current = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#334155',
        progressColor: '#22d3ee',
        cursorColor: '#fff',
        height: 120,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        responsive: true,
        normalize: true,
        mediaControls: false, 
        backend: 'MediaElement',
        plugins: [regionsPluginRef.current],
      });

      wavesurferRef.current.on('finish', () => setIsPlaying(false));
      
      // Hook up analysis when ready
      wavesurferRef.current.on('ready', () => {
         setupAudioGraph();
      });

      // Capture original buffer when loaded for reset functionality
      wavesurferRef.current.on('decode', () => {
         const buffer = wavesurferRef.current.getDecodedData();
         if (buffer && !originalBuffer) {
             setOriginalBuffer(buffer);
         }
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
      cleanupAudioAnalysis();
    };
  }, []);

  useEffect(() => {
    if (file && wavesurferRef.current) {
      // Reset controls
      setPitch(0);
      setSpeed(1.0);
      setIsReverse(false);
      setLoudness(-60);
      setPeak(0);
      setFilterFreq(20000);
      setReverbAmount(0);
      setPreservePitch(false);
      setOriginalBuffer(null);
      setIncludeHandles(false);
      
      if (regionsPluginRef.current) {
          regionsPluginRef.current.clearRegions();
      }

      const media = document.createElement('audio');
      media.crossOrigin = 'anonymous';
      media.src = file.url;
      media.preservesPitch = preservePitch; 

      wavesurferRef.current.loadMediaElement(media);
    }
  }, [file]);

  // Handle Playback Rate and Pitch
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(speed);
      
      // Update media element preservesPitch attribute dynamically
      const media = wavesurferRef.current.getMediaElement();
      if (media) {
          media.preservesPitch = preservePitch;
      }
    }
  }, [speed, preservePitch]);

  // Handle FX Updates
  useEffect(() => {
      if (filterNodeRef.current) {
          filterNodeRef.current.type = filterType;
          // Smooth transition
          filterNodeRef.current.frequency.setTargetAtTime(filterFreq, audioContextRef.current!.currentTime, 0.1);
      }
  }, [filterFreq, filterType]);

  useEffect(() => {
      if (dryGainNodeRef.current && wetGainNodeRef.current) {
          dryGainNodeRef.current.gain.setTargetAtTime(1 - reverbAmount, audioContextRef.current!.currentTime, 0.1);
          wetGainNodeRef.current.gain.setTargetAtTime(reverbAmount, audioContextRef.current!.currentTime, 0.1);
      }
  }, [reverbAmount]);

  // ... [Audio Graph Setup Code Omitted for Brevity - Same as previous] ...
  const setupAudioGraph = () => {
      try {
        const media = wavesurferRef.current.getMediaElement();
        if (!media) return;

        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }
        const ctx = audioContextRef.current!;

        if (!sourceRef.current) {
             sourceRef.current = ctx.createMediaElementSource(media);
        }
        
        if (!filterNodeRef.current) filterNodeRef.current = ctx.createBiquadFilter();
        if (!reverbNodeRef.current) {
             reverbNodeRef.current = ctx.createConvolver();
             reverbNodeRef.current.buffer = createImpulseResponse(ctx, 2.0, 2.0); 
        }
        if (!dryGainNodeRef.current) dryGainNodeRef.current = ctx.createGain();
        if (!wetGainNodeRef.current) wetGainNodeRef.current = ctx.createGain();
        if (!analyserRef.current) {
            analyserRef.current = ctx.createAnalyser();
            analyserRef.current.fftSize = 1024;
            analyserRef.current.smoothingTimeConstant = 0.85;
        }

        sourceRef.current.disconnect();
        filterNodeRef.current.disconnect();
        dryGainNodeRef.current.disconnect();
        wetGainNodeRef.current.disconnect();
        reverbNodeRef.current.disconnect();
        analyserRef.current.disconnect();

        sourceRef.current.connect(filterNodeRef.current);
        filterNodeRef.current.connect(dryGainNodeRef.current);
        filterNodeRef.current.connect(reverbNodeRef.current);
        reverbNodeRef.current.connect(wetGainNodeRef.current);
        dryGainNodeRef.current.connect(analyserRef.current);
        wetGainNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
        startAnalysisLoop();

      } catch (e) {
          console.warn("Audio Graph Setup Error (CORS?)", e);
      }
  };

   const createImpulseResponse = (ctx: AudioContext, duration: number, decay: number) => {
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
        const n = length - i;
        const noise = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
        left[i] = noise;
        right[i] = noise;
    }
    return impulse;
  };

  const cleanupAudioAnalysis = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const startAnalysisLoop = () => {
      if (!analyserRef.current) return;
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);

      const draw = () => {
          rafRef.current = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);
          analyser.getByteTimeDomainData(timeData);

          if (canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  ctx.fillStyle = '#0f172a';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  const barWidth = (canvas.width / (bufferLength / 8)) * 2.5;
                  let barHeight;
                  let x = 0;
                  for (let i = 0; i < bufferLength; i += 8) {
                      barHeight = (dataArray[i] / 255) * canvas.height;
                      const hue = 180 + (barHeight / canvas.height) * 40; 
                      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                      x += barWidth + 1;
                  }
              }
          }

          if (expandedAnalysis && largeCanvasRef.current) {
              const lgCanvas = largeCanvasRef.current;
              const lgCtx = lgCanvas.getContext('2d');
              if (lgCtx) {
                  const w = lgCanvas.width;
                  const h = lgCanvas.height;
                  lgCtx.clearRect(0, 0, w, h);
                  lgCtx.strokeStyle = 'rgba(255,255,255,0.1)';
                  lgCtx.beginPath();
                  lgCtx.moveTo(0, h/2); lgCtx.lineTo(w, h/2);
                  lgCtx.stroke();
                  const barWidth = (w / bufferLength) * 2.5;
                  let barHeight;
                  let x = 0;
                  for (let i = 0; i < bufferLength; i++) {
                      barHeight = (dataArray[i] / 255) * h;
                      const gradient = lgCtx.createLinearGradient(0, h, 0, h - barHeight);
                      gradient.addColorStop(0, '#06b6d4'); 
                      gradient.addColorStop(0.5, '#3b82f6'); 
                      gradient.addColorStop(1, '#a855f7'); 
                      lgCtx.fillStyle = gradient;
                      lgCtx.fillRect(x, h - barHeight, barWidth, barHeight);
                      x += barWidth;
                  }
              }
          }

          let sum = 0;
          let maxVal = 0;
          for (let i = 0; i < bufferLength; i++) {
              const amplitude = (timeData[i] - 128) / 128; 
              sum += amplitude * amplitude;
              if (Math.abs(amplitude) > maxVal) maxVal = Math.abs(amplitude);
          }
          const rms = Math.sqrt(sum / bufferLength);
          const db = 20 * Math.log10(rms + 0.0001);
          setLoudness(Math.max(-60, db));
          setPeak(maxVal);
      };
      draw();
  };


  // ... [Keep existing Buffer Manipulation functions] ...
  const getBuffer = (): AudioBuffer | null => wavesurferRef.current?.getDecodedData();
  const updateBuffer = (newBuffer: AudioBuffer) => wavesurferRef.current.loadDecodedBuffer(newBuffer);
  
  const handleNormalize = () => {
    const buffer = getBuffer();
    if (!buffer) return;
    let maxAmp = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const data = buffer.getChannelData(channel);
        for (let i = 0; i < data.length; i++) {
            if (Math.abs(data[i]) > maxAmp) maxAmp = Math.abs(data[i]);
        }
    }
    if (maxAmp === 0) return;
    const ratio = 1 / maxAmp;
    const newBuffer = audioContextRef.current!.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const oldData = buffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);
        for (let i = 0; i < oldData.length; i++) {
            newData[i] = oldData[i] * ratio;
        }
    }
    updateBuffer(newBuffer);
  };

  const handleReverse = () => {
      const buffer = getBuffer();
      if (!buffer) return;
      const newBuffer = audioContextRef.current!.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const oldData = buffer.getChannelData(channel);
          const newData = newBuffer.getChannelData(channel);
          for (let i = 0; i < oldData.length; i++) {
              newData[i] = oldData[buffer.length - 1 - i];
          }
      }
      updateBuffer(newBuffer);
      setIsReverse(!isReverse);
  };

  const handleFade = (type: 'in' | 'out', duration: number = 2.0) => {
      const buffer = getBuffer();
      if (!buffer) return;
      const fadeSamples = Math.floor(duration * buffer.sampleRate);
      const newBuffer = audioContextRef.current!.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const oldData = buffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);
        newData.set(oldData);
        if (type === 'in') {
            for (let i = 0; i < fadeSamples; i++) {
                if (i < newData.length) newData[i] *= (i / fadeSamples);
            }
        } else {
            const start = Math.max(0, newData.length - fadeSamples);
            for (let i = start; i < newData.length; i++) {
                newData[i] *= (1 - ((i - start) / fadeSamples));
            }
        }
      }
      updateBuffer(newBuffer);
  };

  const handleTrim = () => {
      const buffer = getBuffer();
      const regions = regionsPluginRef.current.getRegions();
      if (!buffer || regions.length === 0) return;
      const region = regions[0];
      const startSample = Math.floor(region.start * buffer.sampleRate);
      const endSample = Math.floor(region.end * buffer.sampleRate);
      const length = endSample - startSample;
      if (length <= 0) return;
      const newBuffer = audioContextRef.current!.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const oldData = buffer.getChannelData(channel);
          const newData = newBuffer.getChannelData(channel);
          const segment = oldData.slice(startSample, endSample);
          newData.set(segment);
      }
      updateBuffer(newBuffer);
      regionsPluginRef.current.clearRegions();
  };
  
  const handleReset = () => {
      if (originalBuffer && wavesurferRef.current) {
          wavesurferRef.current.loadDecodedBuffer(originalBuffer);
          setSpeed(1.0);
          setPitch(0);
          setIsReverse(false);
          setFilterFreq(20000);
          setReverbAmount(0);
      }
  }

  const toggleRegionMode = () => {
      if (!regionsPluginRef.current) return;
      regionsPluginRef.current.clearRegions();
      if (!isEditMode) {
          const duration = wavesurferRef.current.getDuration();
          regionsPluginRef.current.addRegion({
              start: duration * 0.25,
              end: duration * 0.75,
              color: 'rgba(34, 211, 238, 0.3)',
              drag: true,
              resize: true
          });
      }
      setIsEditMode(!isEditMode);
  };

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
      }
    }
  };

  // --- EXPORT LOGIC ---
  const handleExport = async () => {
      if (!file) return;
      setIsProcessingCloud(true);

      try {
          const regions = regionsPluginRef.current?.getRegions();
          let trimStart = 0;
          let trimEnd = wavesurferRef.current.getDuration();

          if (regions && regions.length > 0) {
              trimStart = regions[0].start;
              trimEnd = regions[0].end;
          }

          // Apply Handles Logic
          if (includeHandles) {
              trimStart = Math.max(0, trimStart - 2);
              trimEnd = trimEnd + 2; // Duration logic handled in backend or assume file is long enough
          }

          const params = {
              trimStart,
              trimEnd,
              speed: speed,
              pitch: pitch,
              normalize: false, // Add toggle if needed
          };
          
          // If file.path is local (simulation), we can't process on server. Check if cloud URL.
          // For demo, we assume file.path is a storage reference or we use file.url
          // Since file.path in mock is local, we might fail. 
          // Assuming FieldMode files have "uploads/" path.
          
          const storagePath = file.path.startsWith('/') ? 'demo/path.wav' : file.path;

          const response = await getProcessedAudioUrl(file.id, storagePath, params);
          
          // Trigger Download
          if (response.downloadUrl) {
              const link = document.createElement('a');
              link.href = response.downloadUrl;
              link.download = `Processed_${file.filename}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          }

      } catch (e) {
          console.error("Export failed", e);
          alert("Export failed. Ensure you are logged in and the file is in cloud storage.");
      } finally {
          setIsProcessingCloud(false);
      }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!file) return;
    
    if (file.origin === 'LOCAL') {
        // Desktop Bridge Simulation
        e.dataTransfer.effectAllowed = 'link';
        e.dataTransfer.setData('text/plain', file.path);
        console.log(`[Desktop Bridge] Dragging Local Asset: ${file.path}`);
    } else {
        // Cloud Download Simulation
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', file.path); 
        e.dataTransfer.setData('DownloadURL', `audio/${file.format}:${file.filename}:${file.url}`);
    }
  };

  if (!file) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 bg-slate-900/50 border-t border-slate-800">
        Select a file to preview and edit
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border-t border-slate-700 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-30 relative flex flex-col">
      
      {/* EXPANDED ANALYSIS DASHBOARD */}
      {expandedAnalysis && (
          <div className="bg-slate-950 border-b border-slate-800 animate-slide-up relative">
             {/* ... [Analysis UI Content same as previous] ... */}
             <div className="absolute top-3 right-3 z-10">
                   <button onClick={() => setExpandedAnalysis(false)} className="text-slate-500 hover:text-white transition-colors">
                       <ArrowsPointingOutIcon className="w-5 h-5 transform rotate-180" />
                   </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 h-64">
                  <div className="lg:col-span-2 relative border-r border-slate-800">
                      <canvas ref={largeCanvasRef} width={800} height={256} className="w-full h-full" />
                      <div className="absolute top-2 left-3 text-[10px] font-mono text-cyan-500/50 font-bold">FREQUENCY SPECTRUM (FFT)</div>
                  </div>
                  <div className="p-6 flex flex-col justify-between">
                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Signal Statistics</h4>
                          <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                  <span className="text-slate-500 text-sm">Loudness (RMS)</span>
                                  <span className={`text-xl font-mono font-bold ${loudness > -6 ? 'text-red-500' : 'text-cyan-400'}`}>
                                      {loudness.toFixed(1)} dB
                                  </span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-slate-500 text-sm">True Peak</span>
                                  <span className={`text-xl font-mono font-bold ${peak > 0.98 ? 'text-red-500' : 'text-green-400'}`}>
                                      {(peak * 100).toFixed(0)}%
                                  </span>
                              </div>
                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                                  <div 
                                    className={`h-full transition-all duration-100 ${peak > 0.95 ? 'bg-gradient-to-r from-green-500 to-red-500' : 'bg-green-500'}`} 
                                    style={{ width: `${Math.min(peak * 100, 100)}%` }}
                                  ></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Main Controls Row */}
      <div className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full lg:w-auto">
           <button 
             onClick={togglePlay}
             className="w-12 h-12 flex-shrink-0 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-all"
           >
             {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
           </button>
           <div className="min-w-0">
             <h3 className="text-white font-bold truncate max-w-[200px] lg:max-w-xs">{file.filename}</h3>
             <p className="text-xs text-slate-400 flex gap-2 font-mono">
                <span>{file.sampleRate}Hz</span>
                <span className="text-slate-600">|</span>
                <span>{file.bitDepth}bit</span>
                <span className="text-slate-600">|</span>
                <span>{file.channels === 1 ? 'Mono' : 'Stereo'}</span>
             </p>
           </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
             {/* EXPORT CONTROLS */}
             <div className="flex items-center gap-3 mr-4 border-r border-slate-700 pr-4">
                 <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${includeHandles ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600 bg-slate-800'}`}>
                          {includeHandles && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={includeHandles} onChange={e => setIncludeHandles(e.target.checked)} />
                      <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Handles (2s)</span>
                 </label>

                 <button 
                    onClick={handleExport}
                    disabled={isProcessingCloud}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 px-3 rounded flex items-center gap-2 transition-colors disabled:opacity-50 border border-slate-700"
                 >
                    {isProcessingCloud ? <SpinnerIcon className="w-4 h-4 animate-spin text-cyan-400" /> : <DownloadIcon className="w-4 h-4" />}
                    Export Processed
                 </button>
             </div>

             {/* Tool Toggles */}
             <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                 <button 
                    onClick={() => setShowFX(!showFX)}
                    className={`p-2 rounded transition-all ${showFX ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="FX Rack"
                 >
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                 </button>
                 <button 
                    onClick={toggleRegionMode}
                    className={`p-2 rounded transition-all ${isEditMode ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Quick Edit"
                 >
                    <EditIcon className="w-4 h-4" />
                 </button>
             </div>

            {/* Signal Analysis Widget */}
            <div 
                onClick={() => setExpandedAnalysis(!expandedAnalysis)}
                className={`hidden md:flex border rounded-lg p-2 items-center gap-3 h-16 cursor-pointer transition-all ${expandedAnalysis ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                title="Expand Analysis Dashboard"
            >
                <div className="flex flex-col justify-between h-full text-[10px] font-mono text-slate-400 w-16">
                    <div className="flex justify-between">
                        <span>LFS</span>
                        <span className={loudness > -3 ? 'text-red-500' : 'text-cyan-400'}>{loudness.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>PK</span>
                        <span className={peak > 0.95 ? 'text-red-500' : 'text-green-400'}>{(peak * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                        <div 
                            className={`h-full ${peak > 0.9 ? 'bg-red-500' : 'bg-green-500'} transition-all duration-75`} 
                            style={{ width: `${Math.min(peak * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
                <div className="w-24 h-full bg-slate-900 rounded border border-slate-800 overflow-hidden relative group">
                    <canvas ref={canvasRef} width={100} height={48} className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-0 left-0 p-0.5 flex justify-between w-full items-start">
                        <ActivityIcon className="w-3 h-3 text-slate-600" />
                        <ArrowsPointingOutIcon className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>

            {/* DAW Drag Handle */}
            <div 
                draggable 
                onDragStart={handleDragStart}
                className={`flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing group p-2 rounded-xl hover:bg-slate-800 transition-colors border border-dashed border-transparent ${file.origin === 'LOCAL' ? 'hover:border-amber-500/50' : 'hover:border-cyan-500/50'}`}
                title={file.origin === 'LOCAL' ? "Local File: Drag to DAW" : "Cloud File: Drag to Desktop"}
            >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                    file.origin === 'LOCAL'
                    ? 'bg-gradient-to-br from-amber-600 to-orange-700 shadow-amber-900/50'
                    : 'bg-gradient-to-br from-cyan-600 to-blue-700 shadow-cyan-900/50'
                }`}>
                    {file.origin === 'LOCAL' ? <HardDriveIcon className="w-5 h-5 text-white" /> : <DragHandleIcon className="w-5 h-5 text-white" />}
                </div>
            </div>
        </div>
      </div>
      
      {/* FX RACK */}
      {showFX && (
          <div className="bg-slate-950/80 border-t border-b border-slate-800 py-3 px-6 grid grid-cols-2 md:grid-cols-4 gap-8 animate-slide-up backdrop-blur-sm">
              {/* ... FX Controls ... */}
              <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Playback Rate</span>
                  <input type="range" min="0.2" max="2.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              </div>
              <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Filter</span>
                  <input type="range" min="100" max="20000" step="100" value={filterFreq} onChange={(e) => setFilterFreq(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
              </div>
              <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Reverb</span>
                  <input type="range" min="0" max="0.8" step="0.05" value={reverbAmount} onChange={(e) => setReverbAmount(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
              </div>
               <div className="flex flex-col gap-2 justify-center">
                    <button onClick={handleReverse} className={`flex items-center justify-center gap-2 p-2 rounded border ${isReverse ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                        <RewindIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">Reverse</span>
                    </button>
               </div>
          </div>
      )}

      {/* Editor Toolbar */}
      {isEditMode && (
          <div className="bg-slate-950 border-t border-b border-slate-800 py-2 px-4 flex flex-wrap gap-4 items-center justify-center animate-slide-up">
              {/* ... Editor Controls ... */}
              <button onClick={handleTrim} className="p-2 bg-slate-800 rounded-md text-slate-400"><ScissorsIcon className="w-5 h-5" /></button>
              <button onClick={handleNormalize} className="p-2 bg-slate-800 rounded-md text-slate-400"><SparklesIcon className="w-5 h-5" /></button>
              <button onClick={() => handleFade('in')} className="p-2 bg-slate-800 rounded-md text-slate-400"><ChartBarIcon className="w-5 h-5 transform -scale-x-100" /></button>
              <button onClick={() => handleFade('out')} className="p-2 bg-slate-800 rounded-md text-slate-400"><ChartBarIcon className="w-5 h-5" /></button>
              <button onClick={handleReset} className="p-2 bg-slate-800 rounded-md text-slate-400"><ArrowPathIcon className="w-5 h-5" /></button>
          </div>
      )}

      {/* Waveform Canvas */}
      <div ref={containerRef} className={`w-full transition-all duration-300 ${isEditMode ? 'h-[200px] bg-slate-900' : 'h-24 bg-slate-950/50'}`}></div>
    </div>
  );
};

export default LibraryPlayer;
