
import React, { useState } from 'react';
import Modal from './Modal';
import ComputerDesktopIcon from './icons/ComputerDesktopIcon';
import HardDriveIcon from './icons/HardDriveIcon';
import { registerLocalFile } from '../services/api';
import SpinnerIcon from './icons/SpinnerIcon';

interface DesktopBridgeProps {
  isOpen: boolean;
  onClose: () => void;
}

const DesktopBridge: React.FC<DesktopBridgeProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('connected');
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

  const handleSimulateIndexing = async () => {
      setIsSimulating(true);
      addLog("Scanning local drive (D:/SFX/)...");
      
      try {
          // 1. Mock File Data found on "Disk"
          const mockLocalFile = {
              metadata: {
                  filename: "Amb_Train_Distance_Night.wav",
                  description: "Distant train passing at night, quiet ambience. Indexed from local NAS.",
                  tags: ["train", "distance", "night", "ambience", "local"],
                  category: "Transport",
                  duration: 145.5,
                  sampleRate: 96000,
                  bitDepth: 24,
                  channels: 2,
                  format: "wav"
              },
              localPath: "D:/SFX/Transport/Trains/Amb_Train_Distance_Night.wav"
          };

          // 2. Call Cloud Function
          addLog(`Found file: ${mockLocalFile.metadata.filename}`);
          addLog("Sending metadata to Cloud Bridge...");
          
          await registerLocalFile(mockLocalFile);
          
          addLog("✅ Metadata registered successfully!");
          addLog("File is now visible in your Pro Library.");

      } catch (error: any) {
          console.error(error);
          addLog(`❌ Error: ${error.message}`);
      } finally {
          setIsSimulating(false);
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Desktop Bridge Companion">
        <div className="flex flex-col gap-6">
            {/* Status Header */}
            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${status === 'connected' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <ComputerDesktopIcon className={`w-6 h-6 ${status === 'connected' ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Soundscape Bridge</h3>
                        <p className="text-xs text-slate-400 font-mono">v1.4.2 • {status === 'connected' ? 'Online' : 'Offline'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-bold text-slate-400 uppercase">{status}</span>
                </div>
            </div>

            <div className="text-sm text-slate-400">
                <p className="mb-2">The Desktop Bridge allows you to index files from your local hard drives or NAS directly to the Soundscape Cloud without uploading the audio files.</p>
                <p>This feature requires the <b>Soundscape Companion App</b> running on your machine.</p>
            </div>

            {/* Simulation Controls */}
            <div className="border-t border-slate-700 pt-6">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <HardDriveIcon className="w-4 h-4 text-cyan-400" />
                    Local Indexing Simulator
                </h4>
                
                <button 
                    onClick={handleSimulateIndexing}
                    disabled={isSimulating || status !== 'connected'}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSimulating ? <SpinnerIcon className="w-5 h-5 animate-spin text-cyan-400" /> : 'Simulate Indexing "D:/SFX/..."'}
                </button>
            </div>

            {/* Console Logs */}
            <div className="bg-black/50 rounded-lg p-3 h-32 overflow-y-auto border border-slate-800 font-mono text-xs space-y-1">
                {logs.length === 0 && <span className="text-slate-600 italic">Waiting for activity...</span>}
                {logs.map((log, i) => (
                    <div key={i} className="text-green-400 border-l-2 border-green-500/30 pl-2">
                        <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
                    </div>
                ))}
            </div>
        </div>
    </Modal>
  );
};

export default DesktopBridge;
