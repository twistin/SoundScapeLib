
import React, { useState, useMemo, useEffect } from 'react';
import { AudioFile } from '../types';
import { mockLibraryData } from '../data/mockLibrary';
import LibraryPlayer from './LibraryPlayer';
import SearchIcon from './icons/SearchIcon';
import FolderIcon from './icons/FolderIcon';
import MagicWandIcon from './icons/MagicWandIcon';
import EditIcon from './icons/EditIcon';
import BoltIcon from './icons/BoltIcon';
import WindIcon from './icons/WindIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import ComputerDesktopIcon from './icons/ComputerDesktopIcon';
import CloudIcon from './icons/CloudIcon';
import HardDriveIcon from './icons/HardDriveIcon';
import { ToneGeneratorModal, WhooshCreatorModal } from './LibraryPlugins';
import Modal from './Modal';
import AudioRecorder from './AudioRecorder';
import DesktopBridge from './DesktopBridge';
import { subscribeToLibrary } from '../services/db'; 

interface LibraryModeProps {}

const LibraryMode: React.FC<LibraryModeProps> = () => {
  const [library, setLibrary] = useState<AudioFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSampleRate, setSelectedSampleRate] = useState<string>('All');

  // Indexing State
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState(0);

  // Batch Editing
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Modals & Tools
  const [showToneGen, setShowToneGen] = useState(false);
  const [showWhooshGen, setShowWhooshGen] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showBridge, setShowBridge] = useState(false);

  // Real-time Library Subscription
  useEffect(() => {
      const unsubscribe = subscribeToLibrary((files) => {
          if (files.length === 0 && process.env.NODE_ENV === 'development') {
               // Inject Cloud Origin for mock data
               const mockWithOrigin = mockLibraryData.map(f => ({ ...f, origin: 'CLOUD' as const }));
               setLibrary(mockWithOrigin); 
          } else {
               setLibrary(files);
          }
      });
      return () => unsubscribe();
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(library.map(f => f.category)))], [library]);
  const sampleRates = ['All', '44100', '48000', '96000', '192000'];

  const handleScanLocal = () => {
    // Now triggers the Desktop Bridge modal instead of simple mock loading
    setShowBridge(true);
  };

  const toggleSelection = (id: string, multiSelect: boolean) => {
    if (isBatchMode) {
        const newSet = new Set(selectedFileIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedFileIds(newSet);
    } else {
        setSelectedFileId(id);
    }
  };

  const handleFindSimilar = () => {
      if (!selectedFileId) return;
      const file = library.find(f => f.id === selectedFileId);
      if (file) {
          setSearchTerm(`related:${file.category}`); 
          alert(`AI Analysis: Searching for textures similar to "${file.filename}"...`);
      }
  };
  
  const handleAddGeneratedFile = (file: AudioFile) => {
      // Set origin for generated files
      const newFile = { ...file, origin: 'CLOUD' as const };
      setLibrary(prev => [newFile, ...prev]);
      setSelectedFileId(file.id);
  };
  
  const handleRecordingComplete = (blob: Blob, duration: number) => {
      setShowRecorder(false);
  };

  const filteredLibrary = useMemo(() => {
    return library.filter(file => {
      const matchesSearch = 
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        file.description.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
      const matchesSampleRate = selectedSampleRate === 'All' || file.sampleRate.toString() === selectedSampleRate;

      return matchesSearch && matchesCategory && matchesSampleRate;
    });
  }, [library, searchTerm, selectedCategory, selectedSampleRate]);

  const selectedFile = useMemo(() => library.find(f => f.id === selectedFileId) || null, [library, selectedFileId]);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-950 overflow-hidden animate-fade-in">
      {/* Toolbar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between flex-shrink-0">
         <div className="flex items-center gap-4 w-1/3">
             <div className="relative w-full group">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search sounds, tags, metadata..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
             </div>
         </div>

         <div className="flex items-center gap-3">
             <div className="h-6 w-[1px] bg-slate-700 mx-2"></div>
             <button onClick={() => setShowToneGen(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-md border border-slate-700 transition-colors" title="Tone Generator">
                 <BoltIcon className="w-4 h-4 text-yellow-400" />
                 <span className="hidden xl:inline">Tone</span>
             </button>
             <button onClick={() => setShowWhooshGen(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-md border border-slate-700 transition-colors" title="Whoosh Creator">
                 <WindIcon className="w-4 h-4 text-cyan-400" />
                 <span className="hidden xl:inline">Whoosh</span>
             </button>
             <button onClick={() => setShowRecorder(true)} className="flex items-center gap-2 px-3 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-sm rounded-md border border-red-900/30 transition-colors" title="Record Direct">
                 <MicrophoneIcon className="w-4 h-4" />
                 <span className="hidden xl:inline">Record</span>
             </button>
             <div className="h-6 w-[1px] bg-slate-700 mx-2"></div>
             
             <button onClick={handleScanLocal} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-md border border-slate-700 transition-colors group">
                 <ComputerDesktopIcon className="w-4 h-4 group-hover:text-green-400 transition-colors" />
                 Desktop Bridge
             </button>
             
             <button onClick={() => setIsBatchMode(!isBatchMode)} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md border transition-colors ${isBatchMode ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'}`}>
                 <EditIcon className="w-4 h-4" />
                 Batch
             </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-grow overflow-hidden">
          {/* Sidebar Filters */}
          <div className="w-64 bg-slate-900/50 border-r border-slate-800 p-4 overflow-y-auto flex-shrink-0 hidden md:block">
              <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Categories</h4>
                  <div className="space-y-1">
                      {categories.map(cat => (
                          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${selectedCategory === cat ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>{cat}</button>
                      ))}
                  </div>
              </div>
          </div>

          {/* File List */}
          <div className="flex-grow overflow-y-auto bg-slate-950 p-2">
              <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-950 z-10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                          <th className="p-3 border-b border-slate-800 w-10"></th>
                          <th className="p-3 border-b border-slate-800 w-10">Loc</th>
                          <th className="p-3 border-b border-slate-800">Name</th>
                          <th className="p-3 border-b border-slate-800">Description</th>
                          <th className="p-3 border-b border-slate-800 w-24">Dur</th>
                          <th className="p-3 border-b border-slate-800 w-24">Fmt</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-800/50">
                      {filteredLibrary.map(file => {
                          const isSelected = isBatchMode ? selectedFileIds.has(file.id) : selectedFileId === file.id;
                          return (
                              <tr 
                                key={file.id}
                                onClick={() => toggleSelection(file.id, false)}
                                className={`group cursor-pointer transition-colors ${isSelected ? 'bg-cyan-900/20 hover:bg-cyan-900/30' : 'hover:bg-slate-900'}`}
                              >
                                  <td className="p-3 text-center">
                                      {isBatchMode && <input type="checkbox" checked={selectedFileIds.has(file.id)} onChange={() => toggleSelection(file.id, true)} className="rounded bg-slate-700 border-slate-600 text-cyan-500" />}
                                  </td>
                                  <td className="p-3 text-center">
                                      {file.origin === 'LOCAL' ? (
                                          <div title={`Local File: ${file.path}`} className="inline-block">
                                              <HardDriveIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                                          </div>
                                      ) : (
                                          <div title="Cloud Asset" className="inline-block">
                                              <CloudIcon className="w-4 h-4 text-cyan-500/70 group-hover:text-cyan-400" />
                                          </div>
                                      )}
                                  </td>
                                  <td className={`p-3 font-medium ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                                      <div className="flex items-center gap-2">
                                          {file.filename}
                                          {file.aiStatus === 'PENDING' && (
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-900/50 animate-pulse">
                                                  AI Analyzing...
                                              </span>
                                          )}
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                          {file.tags.slice(0, 3).map(tag => (
                                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{tag}</span>
                                          ))}
                                      </div>
                                  </td>
                                  <td className="p-3 text-slate-400 truncate max-w-xs">{file.description}</td>
                                  <td className="p-3 text-slate-500 font-mono">{file.duration.toFixed(1)}s</td>
                                  <td className="p-3 text-slate-500 uppercase text-xs">{file.format} {file.bitDepth}b</td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Footer Player & Tools */}
      <div className="flex-shrink-0">
         {/* Warning for Local Files */}
         {selectedFile && selectedFile.origin === 'LOCAL' && (
             <div className="bg-slate-900 px-4 py-2 border-t border-slate-800 flex justify-between items-center text-xs text-amber-500 bg-amber-500/5">
                 <div className="flex gap-2 items-center">
                     <HardDriveIcon className="w-3 h-3" />
                     <span className="font-bold">Offline File:</span>
                     <span className="text-slate-400 select-all">Path: {selectedFile.path}</span>
                 </div>
                 <span>Preview not available in browser (Bridge required)</span>
             </div>
         )}

         {/* Player (Only if cloud or generated) */}
         {(!selectedFile || selectedFile.origin !== 'LOCAL') && (
             <LibraryPlayer file={selectedFile} />
         )}
      </div>

      {/* Modals */}
      <ToneGeneratorModal isOpen={showToneGen} onClose={() => setShowToneGen(false)} onGenerate={handleAddGeneratedFile} />
      <WhooshCreatorModal isOpen={showWhooshGen} onClose={() => setShowWhooshGen(false)} onGenerate={handleAddGeneratedFile} />
      <DesktopBridge isOpen={showBridge} onClose={() => setShowBridge(false)} />
      
      <Modal isOpen={showRecorder} onClose={() => setShowRecorder(false)} title="Direct Recording">
          <div className="p-4 flex flex-col items-center">
              <AudioRecorder onRecordingComplete={handleRecordingComplete} />
              <p className="text-xs text-slate-500 mt-4">Recording will be saved directly to the library.</p>
          </div>
      </Modal>
    </div>
  );
};

export default LibraryMode;
