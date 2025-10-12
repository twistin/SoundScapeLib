import { SoundscapeSession, Project, User } from '../types';

export const mockUsers: Record<string, User> = {
  'user1': { id: 'user1', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?u=alex' },
  'user2': { id: 'user2', name: 'Maria', avatarUrl: 'https://i.pravatar.cc/150?u=maria' },
  'user3': { id: 'user3', name: 'David', avatarUrl: 'https://i.pravatar.cc/150?u=david' },
  'user4': { id: 'user4', name: 'Sarah', avatarUrl: 'https://i.pravatar.cc/150?u=sarah' },
};


export const mockProjects: Project[] = [
  { 
    name: 'Nature Field Recordings', 
    attachments: [
      { id: 'proj_attach_1', name: 'Project Location Scouting.pdf', url: '#', type: 'other' }
    ],
    owner: mockUsers['user1'],
    members: [mockUsers['user1'], mockUsers['user3']]
  },
  { 
    name: 'Urban Explorations', 
    attachments: [],
    owner: mockUsers['user2'],
    members: [mockUsers['user2']]
  },
  { 
    name: 'Client Work', 
    attachments: [],
    owner: mockUsers['user4'],
    members: [mockUsers['user4'], mockUsers['user1'], mockUsers['user2']]
  },
  { 
    name: 'Industrial Tones', 
    attachments: [],
    owner: mockUsers['user1'],
    members: [mockUsers['user1']]
  },
];

export const mockSessions: SoundscapeSession[] = [
  {
    id: '1',
    title: 'Forest Creek',
    author: 'Acoustic Nature',
    project: 'Nature Field Recordings',
    description: 'A tranquil recording of a gentle creek flowing through a dense, sun-dappled forest in the early morning. Birds can be heard chirping in the background, creating a peaceful and immersive atmosphere.',
    location: { name: 'Redwood National Park, USA', lat: 41.2132, lng: -124.0046 },
    imageUrl: 'https://picsum.photos/seed/forest/800/600',
    audioUrl: 'https://archive.org/download/sound-effects-for-makers/forest-wind-and-birds.mp3',
    equipment: 'Sennheiser MKH 8040, Sound Devices MixPre-6',
    soundType: 'Forest',
    date: '2023-05-15',
    attachments: [
        { id: 'attach1', name: 'Field Notes.txt', url: '#', type: 'other' },
        { id: 'attach2', name: 'Alternate Angle.jpg', url: 'https://picsum.photos/seed/forest-alt/800/600', type: 'image' },
        { id: 'attach3', name: 'Bird Call Sample.mp3', url: 'https://archive.org/download/sound-effects-for-makers/bird-call.mp3', type: 'audio' },
    ]
  },
  {
    id: '2',
    title: 'Urban Nightfall',
    author: 'CityScapes Audio',
    project: 'Urban Explorations',
    description: 'The vibrant sounds of a bustling city as day turns to night. Distant sirens, traffic hum, and the murmur of crowds blend into a complex urban symphony.',
    location: { name: 'Tokyo, Japan', lat: 35.6895, lng: 139.6917 },
    imageUrl: 'https://picsum.photos/seed/city/800/600',
    audioUrl: 'https://archive.org/download/sound-effects-for-makers/city-traffic.mp3',
    equipment: 'DPA 4060, Zoom F6',
    soundType: 'Urban',
    date: '2023-09-22',
    attachments: [],
  },
  {
    id: '3',
    title: 'Coastal Waves',
    author: 'Oceanic Sounds',
    project: 'Client Work',
    description: 'Powerful waves crashing against a rocky shoreline during high tide. The roar of the ocean is accompanied by the cries of distant gulls and the salty sea spray.',
    location: { name: 'Cliffs of Moher, Ireland', lat: 52.9715, lng: -9.4244 },
    imageUrl: 'https://picsum.photos/seed/ocean/800/600',
    audioUrl: 'https://archive.org/download/sound-effects-for-makers/ocean-waves.mp3',
    equipment: 'Rode NT-SF1, Tascam Portacapture X8',
    soundType: 'Marine',
    date: '2023-07-30',
    attachments: [],
  },
  {
    id: '4',
    title: 'Desert Wind',
    author: 'Acoustic Nature',
    project: 'Nature Field Recordings',
    description: 'The haunting sound of wind sweeping across vast sand dunes at sunset. A stark and beautiful soundscape that captures the solitude of the desert.',
    location: { name: 'Sahara Desert, Morocco', lat: 23.4162, lng: 25.6628 },
    imageUrl: 'https://picsum.photos/seed/desert/800/600',
    audioUrl: 'https://archive.org/download/sound-effects-for-makers/desert-wind.mp3',
    equipment: 'LOM Usi Pro, Sony PCM-D100',
    soundType: 'Desert',
    date: '2024-01-10',
    attachments: [],
  },
    {
    id: '5',
    title: 'Rain on Tin Roof',
    author: 'CityScapes Audio',
    project: 'Urban Explorations',
    description: 'A cozy and rhythmic recording of a steady downpour on a tin roof. The gentle drumming of the rain creates a relaxing and hypnotic ambience.',
    location: { name: 'Rural Cabin, USA', lat: 34.0522, lng: -118.2437 },
    imageUrl: 'https://picsum.photos/seed/rain/800/600',
    audioUrl: 'https://archive.org/download/sound-effects-for-makers/rain.mp3',
    equipment: 'Sennheiser Ambeo, Sound Devices MixPre-3 II',
    soundType: 'Urban',
    date: '2023-11-05',
    attachments: [],
  },
  {
    id: '6',
    title: 'Dockside Ambience',
    author: 'Oceanic Sounds',
    project: 'Client Work',
    description: 'The gentle lapping of water against wooden pylons, the clang of rigging on sailboat masts, and the distant hum of a working harbor create a serene maritime atmosphere.',
    location: { name: 'Newport Harbor, USA', lat: 41.4901, lng: -71.3128 },
    imageUrl: 'https://picsum.photos/seed/harbor/800/600',
    audioUrl: 'https://archive.org/download/sound-effects-for-makers/harbor.mp3',
    equipment: 'Aquarian H2a Hydrophone, Zoom F3',
    soundType: 'Marine',
    date: '2023-08-12',
    attachments: [],
  },
    {
    id: '7',
    title: 'Summer Meadow',
    author: 'Acoustic Nature',
    project: 'Nature Field Recordings',
    description: 'A vibrant summer meadow alive with the buzzing of insects, the chirping of crickets, and a gentle breeze rustling through tall grass. A quintessential sound of a perfect summer day.',
    location: { name: 'Tuscany, Italy', lat: 43.7711, lng: 11.2546 },
    imageUrl: 'https://picsum.photos/seed/meadow/800/600',
    audioUrl: 'https://archive.org/download/Crickets_and_cicadas_in_the_Shrub-Steppe_of_central_WA/crickets_and_cicadas_wa_shrub-steppe.mp3',
    equipment: 'LOM Priezor, Sony PCM-A10',
    soundType: 'Forest',
    date: '2023-06-21',
    attachments: [],
  },
  {
    id: '8',
    title: 'Factory Hum',
    author: 'Industrial Tones',
    project: 'Urban Explorations',
    description: 'The deep, resonant hum of heavy machinery in a large industrial factory. The rhythmic clanking and whirring of machines create a powerful and hypnotic soundscape.',
    location: { name: 'Ruhr Valley, Germany', lat: 51.4775, lng: 7.2201 },
    imageUrl: 'https://picsum.photos/seed/factory/800/600',
    audioUrl: 'https://archive.org/download/sound-effects-for-makers/factory.mp3',
    equipment: 'Clippy EM272, Tascam DR-100mkIII',
    soundType: 'Industrial',
    date: '2024-02-18',
    attachments: [],
  }
];