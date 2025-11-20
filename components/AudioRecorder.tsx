import React, { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Audio Context for visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob, recordingTime);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      drawVisualizer();

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      // Clear with transparency for trail effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5;

        // Neon Gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, '#06b6d4'); // Cyan 500
        gradient.addColorStop(1, '#3b82f6'); // Blue 500

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#22d3ee";
        
        // Draw rounded bars
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 2;
      }
    };

    draw();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full h-40 bg-slate-950 rounded-xl overflow-hidden mb-8 border border-slate-800 shadow-inner">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={160} 
          className="w-full h-full relative z-10"
        />
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-cyan-400 px-3 py-1 rounded-full text-sm font-mono border border-cyan-500/30 z-20">
          {formatTime(recordingTime)}
        </div>
      </div>
      
      <div className="relative group">
          {/* Pulse Effect */}
          {isRecording && (
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
          )}
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 border-4 ${
              isRecording 
                ? 'bg-slate-900 border-red-500 hover:bg-slate-800' 
                : 'bg-gradient-to-br from-cyan-500 to-blue-600 border-slate-900 hover:shadow-cyan-500/50'
            }`}
          >
            {isRecording ? (
              <div className="w-8 h-8 bg-red-500 rounded-md shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
            ) : (
              <div className="w-8 h-8 bg-white rounded-full shadow-lg" />
            )}
          </button>
      </div>
      
      <p className="mt-6 text-slate-400 text-sm font-medium tracking-wide uppercase">
        {isRecording ? <span className="text-red-400 animate-pulse">● Recording Live Audio</span> : 'Tap to Start Recording'}
      </p>
    </div>
  );
};

export default AudioRecorder;