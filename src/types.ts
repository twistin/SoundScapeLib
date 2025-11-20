
export interface AttachedFile {
  id: string;
  name: string;
  url: string;
  type: 'audio' | 'image' | 'other';
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Project {
  name: string;
  attachments: AttachedFile[];
  owner: User;
  members: User[];
  isPublic?: boolean;
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
}

export interface SoundscapeSession {
  id: string;
  title: string;
  author: string;
  project: string;
  description: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  imageUrl: string;
  audioUrl: string;
  equipment: string;
  soundType: 'Forest' | 'Urban' | 'Marine' | 'Desert' | 'Industrial';
  date: string;
  attachments: AttachedFile[];
  weather?: WeatherInfo;
  tags?: {
    biotic: string[];
    geophonic: string[];
    anthropophonic: string[];
  };
  privacy: 'public' | 'private' | 'link';
  duration?: number;
  aiStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
}

// New Interface for Professional Library
export interface AudioFile {
  id: string;
  filename: string;
  path: string; // Local path simulation or Storage Path
  url: string;
  description: string;
  category: string;
  tags: string[];
  duration: number;
  
  // Technical Metadata
  sampleRate: number; // e.g., 48000, 96000
  bitDepth: number; // e.g., 16, 24, 32
  channels: number; // 1 (Mono), 2 (Stereo), 6 (5.1)
  format: 'wav' | 'mp3' | 'aiff' | 'flac';
  
  // Origin (New)
  origin?: 'CLOUD' | 'LOCAL';

  // AI Status
  aiStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
  
  // Processing State (Pre-Edit)
  processing?: {
    pitch: number; // Semitones +/-
    speed: number; // Percentage (1.0 = 100%)
    isReverse: boolean;
  };
}