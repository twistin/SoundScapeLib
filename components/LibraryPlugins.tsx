
import React, { useState } from 'react';
import { AudioFile } from '../types';
import Modal from './Modal';

// --- Helper to generate synthetic buffers ---
const generateTone = async (type: 'sine' | 'square' | 'sawtooth' | 'noise', frequency: number, duration: number): Promise<Blob> => {
    const ctx = new OfflineAudioContext(1, 44100 * duration, 44100);
    
    let source: AudioScheduledSourceNode;
    
    if (type === 'noise') {
        const bufferSize = 44100 * duration;
        const buffer = ctx.createBuffer(1, bufferSize, 44100);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        source = ctx.createBufferSource();
        (source as AudioBufferSourceNode).buffer = buffer;
    } else {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = frequency;
        source = osc;
    }

    const gain = ctx.createGain();
    // Simple envelope
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.5, 0.1);
    gain.gain.linearRampToValueAtTime(0.5, duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, duration);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    const renderedBuffer = await ctx.startRendering();
    
    // Convert AudioBuffer to Wav Blob (Simplified Logic for demo)
    // In production, use a robust WAV encoder. 
    // For now, we will return a generic blob placeholder logic or use a simple wav header function if we had one.
    // To make this actually playable in the app without external libs, we trick it by returning a WebM/WAV blob if possible,
    // OR we return the URL directly if we assume the app handles it. 
    // For this demo, we will rely on the App to handle the Blob URL creation.
    
    // Quick WAV Header construction for compatibility
    const wavBlob = bufferToWav(renderedBuffer, 44100 * duration);
    return wavBlob;
};

const generateWhoosh = async (duration: number, speed: 'fast' | 'slow'): Promise<Blob> => {
    const ctx = new OfflineAudioContext(1, 44100 * duration, 44100);
    
    // Noise Source
    const bufferSize = 44100 * duration;
    const buffer = ctx.createBuffer(1, bufferSize, 44100);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter Sweep
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 5;
    
    const startFreq = 100;
    const endFreq = 8000;
    const peakTime = duration / 2;

    filter.frequency.setValueAtTime(startFreq, 0);
    if (speed === 'fast') {
         filter.frequency.exponentialRampToValueAtTime(endFreq, peakTime);
         filter.frequency.exponentialRampToValueAtTime(startFreq, duration);
    } else {
         filter.frequency.linearRampToValueAtTime(endFreq, peakTime);
         filter.frequency.linearRampToValueAtTime(startFreq, duration);
    }

    // Doppler-ish Gain
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.exponentialRampToValueAtTime(1, peakTime);
    gain.gain.exponentialRampToValueAtTime(0.01, duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    const renderedBuffer = await ctx.startRendering();
    return bufferToWav(renderedBuffer, bufferSize);
};

// --- WAV Encoder Helper ---
function bufferToWav(abuffer: AudioBuffer, len: number) {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;
  
    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
  
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this example)
  
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length
  
    // write interleaved data
    for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));
  
    while(pos < length) {
      for(i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset])); 
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; 
        view.setInt16(pos, sample, true); 
        pos += 2;
      }
      offset++;
    }
  
    return new Blob([buffer], {type: "audio/wav"});
  
    function setUint16(data: any) {
      view.setUint16(pos, data, true);
      pos += 2;
    }
  
    function setUint32(data: any) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
}


// --- COMPONENTS ---

interface ToneGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (file: AudioFile) => void;
}

export const ToneGeneratorModal: React.FC<ToneGeneratorProps> = ({ isOpen, onClose, onGenerate }) => {
    const [type, setType] = useState<'sine' | 'square' | 'sawtooth' | 'noise'>('sine');
    const [freq, setFreq] = useState(1000);
    const [duration, setDuration] = useState(5);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreate = async () => {
        setIsProcessing(true);
        const blob = await generateTone(type, freq, duration);
        const file: AudioFile = {
            id: `tone_${Date.now()}`,
            filename: `Tone_${type}_${freq}Hz.wav`,
            path: 'Generated/Tones',
            url: URL.createObjectURL(blob),
            description: `Synthesized ${type} wave at ${freq}Hz`,
            category: 'Synthesis',
            tags: ['synth', type, 'tone', 'generated'],
            duration: duration,
            sampleRate: 44100,
            bitDepth: 16,
            channels: 1,
            format: 'wav'
        };
        onGenerate(file);
        setIsProcessing(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tone Generator">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Waveform</label>
                        <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                            <option value="sine">Sine</option>
                            <option value="square">Square</option>
                            <option value="sawtooth">Sawtooth</option>
                            <option value="noise">Pink Noise</option>
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-slate-400 mb-2">Duration (s)</label>
                         <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" min="0.1" max="60" />
                    </div>
                </div>
                
                {type !== 'noise' && (
                    <div>
                         <div className="flex justify-between mb-2">
                             <label className="text-sm font-bold text-slate-400">Frequency</label>
                             <span className="text-cyan-400 font-mono">{freq} Hz</span>
                         </div>
                         <input type="range" min="20" max="20000" step="10" value={freq} onChange={(e) => setFreq(Number(e.target.value))} className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none" />
                    </div>
                )}

                <button 
                    onClick={handleCreate}
                    disabled={isProcessing}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isProcessing ? 'Rendering...' : 'Generate Tone'}
                </button>
            </div>
        </Modal>
    );
};


interface WhooshCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (file: AudioFile) => void;
}

export const WhooshCreatorModal: React.FC<WhooshCreatorProps> = ({ isOpen, onClose, onGenerate }) => {
    const [speed, setSpeed] = useState<'fast' | 'slow'>('fast');
    const [duration, setDuration] = useState(2);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreate = async () => {
        setIsProcessing(true);
        const blob = await generateWhoosh(duration, speed);
        const file: AudioFile = {
            id: `whoosh_${Date.now()}`,
            filename: `Whoosh_${speed}_${duration}s.wav`,
            path: 'Generated/Whooshes',
            url: URL.createObjectURL(blob),
            description: `Procedural ${speed} pass-by whoosh`,
            category: 'Synthesis',
            tags: ['whoosh', 'flyby', 'transition', 'generated'],
            duration: duration,
            sampleRate: 44100,
            bitDepth: 16,
            channels: 1,
            format: 'wav'
        };
        onGenerate(file);
        setIsProcessing(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Whoosh Creator">
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Type</label>
                        <div className="flex gap-2">
                            <button onClick={() => setSpeed('fast')} className={`flex-1 py-2 rounded border ${speed === 'fast' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-400'}`}>Fast</button>
                            <button onClick={() => setSpeed('slow')} className={`flex-1 py-2 rounded border ${speed === 'slow' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-400'}`}>Slow</button>
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-slate-400 mb-2">Duration (s)</label>
                         <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" min="0.5" max="10" step="0.5"/>
                    </div>
                </div>
                
                <button 
                    onClick={handleCreate}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isProcessing ? 'Synthesizing...' : 'Create Whoosh'}
                </button>
            </div>
        </Modal>
    );
};
