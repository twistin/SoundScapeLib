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
}

export interface SoundscapeSession {
  id: string;
  title: string;
  author: string;
  project: string; // Links session to a Project
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
}