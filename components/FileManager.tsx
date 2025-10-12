import React, { useRef, useState, useEffect } from 'react';
import { AttachedFile } from '../types';
import UploadIcon from './icons/UploadIcon';
import DocumentIcon from './icons/DocumentIcon';
import PhotoIcon from './icons/PhotoIcon';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import TrashIcon from './icons/TrashIcon';
import DownloadIcon from './icons/DownloadIcon';

interface FileManagerProps {
  attachments: AttachedFile[];
  onFileUpload: (file: File) => void;
  onFileDelete: (attachmentId: string) => void;
}

const FileIcon: React.FC<{ type: AttachedFile['type'] }> = ({ type }) => {
  const className = "w-6 h-6 text-slate-400";
  switch (type) {
    case 'image':
      return <PhotoIcon className={className} />;
    case 'audio':
      return <PlayIcon className={className} />;
    case 'other':
    default:
      return <DocumentIcon className={className} />;
  }
};

const FileManager: React.FC<FileManagerProps> = ({ attachments, onFileUpload, onFileDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioEnd = () => setPlayingAudioId(null);
    audio.addEventListener('ended', handleAudioEnd);

    if (playingAudioId) {
        const fileToPlay = attachments.find(f => f.id === playingAudioId);
        if (fileToPlay && fileToPlay.type === 'audio') {
            audio.src = fileToPlay.url;
            audio.play().catch(e => {
                console.error("Audio playback failed:", e);
                setPlayingAudioId(null);
            });
        }
    } else {
        audio.pause();
    }
    
    return () => {
        audio.removeEventListener('ended', handleAudioEnd);
    }
  }, [playingAudioId, attachments]);


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
      e.target.value = '';
    }
  };
  
  const handlePlayPause = (fileId: string) => {
    if (playingAudioId === fileId) {
        setPlayingAudioId(null);
    } else {
        setPlayingAudioId(fileId);
    }
  };

  const actionButtonClass = "p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors flex-shrink-0";


  return (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
      <audio ref={audioRef} />
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-white">Attachments</h3>
        <button
          onClick={handleUploadClick}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-lg inline-flex items-center gap-2 transition-colors text-sm"
        >
          <UploadIcon className="w-5 h-5" />
          Upload File
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <div className="space-y-2">
        {attachments.length > 0 ? (
          attachments.map(file => {
            const isPlaying = playingAudioId === file.id;
            return (
                <div key={file.id} className="flex items-center justify-between bg-slate-800 p-2 rounded-md group">
                  <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                    {file.type === 'image' ? (
                        <img src={file.url} alt={file.name} className="w-10 h-10 object-cover rounded-md flex-shrink-0 bg-slate-700" />
                    ) : (
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-slate-700/50 rounded-md">
                           <FileIcon type={file.type} />
                        </div>
                    )}
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-cyan-400 truncate transition-colors text-sm font-medium"
                      title={file.name}
                    >
                      {file.name}
                    </a>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {file.type === 'audio' && (
                        <button onClick={() => handlePlayPause(file.id)} className={actionButtonClass} title={isPlaying ? 'Pause' : 'Play'}>
                            {isPlaying ? <PauseIcon className="w-5 h-5 text-cyan-400" /> : <PlayIcon className="w-5 h-5" />}
                        </button>
                    )}
                    <a href={file.url} download={file.name} className={actionButtonClass} title="Download">
                        <DownloadIcon className="w-5 h-5" />
                    </a>
                    <button onClick={() => onFileDelete(file.id)} className={`${actionButtonClass} hover:text-red-500`} title="Delete">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
            )
          })
        ) : (
          <p className="text-slate-500 text-sm text-center py-4">No files attached.</p>
        )}
      </div>
    </div>
  );
};

export default FileManager;