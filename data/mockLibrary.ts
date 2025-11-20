
import { AudioFile } from '../types';

export const mockLibraryData: AudioFile[] = [
  {
    id: 'lib_1',
    filename: 'City_Traffic_Heavy_Loop.wav',
    path: '/Volumes/SFX_Drive_01/Urban/Traffic/',
    url: 'https://actions.google.com/sounds/v1/transportation/car_driving_by.ogg',
    description: 'Heavy city traffic at rush hour, distant sirens, honking, bus passing by.',
    category: 'Urban',
    tags: ['traffic', 'cars', 'bus', 'sirens', 'city', 'rush hour'],
    duration: 124.5,
    sampleRate: 96000,
    bitDepth: 24,
    channels: 2,
    format: 'wav'
  },
  {
    id: 'lib_2',
    filename: 'Forest_Birds_Morning_Ambience.wav',
    path: '/Volumes/SFX_Drive_01/Nature/Forest/',
    url: 'https://actions.google.com/sounds/v1/ambiences/forest_morning.ogg',
    description: 'Peaceful morning in a deciduous forest, multiple bird species calling, light wind in leaves.',
    category: 'Nature',
    tags: ['forest', 'birds', 'morning', 'wind', 'leaves', 'peaceful'],
    duration: 340.2,
    sampleRate: 48000,
    bitDepth: 24,
    channels: 2,
    format: 'wav'
  },
  {
    id: 'lib_3',
    filename: 'SciFi_Door_Hydraulic_Open.wav',
    path: '/Volumes/SFX_Drive_02/SciFi/Doors/',
    url: 'https://actions.google.com/sounds/v1/foley/metal_latch.ogg',
    description: 'Heavy hydraulic door opening with air release and metallic clank.',
    category: 'Sci-Fi',
    tags: ['door', 'hydraulic', 'air', 'pneumatic', 'future', 'space'],
    duration: 2.4,
    sampleRate: 96000,
    bitDepth: 24,
    channels: 1,
    format: 'wav'
  },
  {
    id: 'lib_4',
    filename: 'Ocean_Waves_Crashing_Rocks.wav',
    path: '/Volumes/SFX_Drive_01/Nature/Water/',
    url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rocks.ogg',
    description: 'Large waves crashing against granite rocks, heavy spray, close perspective.',
    category: 'Nature',
    tags: ['ocean', 'waves', 'water', 'crash', 'sea', 'coast'],
    duration: 180.0,
    sampleRate: 192000,
    bitDepth: 32,
    channels: 2,
    format: 'wav'
  },
  {
    id: 'lib_5',
    filename: 'Impact_Metal_Hollow_01.wav',
    path: '/Volumes/SFX_Drive_02/Impacts/Metal/',
    url: 'https://actions.google.com/sounds/v1/foley/tin_can_drop.ogg',
    description: 'Large hollow metal container struck with a hammer. Long resonance.',
    category: 'Impacts',
    tags: ['impact', 'metal', 'hit', 'clang', 'industrial'],
    duration: 4.5,
    sampleRate: 96000,
    bitDepth: 24,
    channels: 1,
    format: 'wav'
  },
  {
    id: 'lib_6',
    filename: 'Rain_Thunderstorm_Heavy.wav',
    path: '/Volumes/SFX_Drive_01/Weather/Rain/',
    url: 'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg',
    description: 'Intense thunderstorm, heavy rain on pavement, close rolling thunder.',
    category: 'Weather',
    tags: ['rain', 'thunder', 'storm', 'weather', 'heavy'],
    duration: 210.0,
    sampleRate: 48000,
    bitDepth: 24,
    channels: 6, // 5.1 Surround
    format: 'wav'
  },
  {
    id: 'lib_7',
    filename: 'UI_Click_Digital_Clean.mp3',
    path: '/Volumes/SFX_Drive_02/UI/Clicks/',
    url: 'https://actions.google.com/sounds/v1/tools/drill_gear_clicks.ogg',
    description: 'Clean digital click for user interface interaction.',
    category: 'UI',
    tags: ['ui', 'click', 'button', 'interface', 'digital'],
    duration: 0.2,
    sampleRate: 44100,
    bitDepth: 16,
    channels: 2,
    format: 'mp3'
  },
  {
    id: 'lib_8',
    filename: 'Footsteps_Gravel_Running.wav',
    path: '/Volumes/SFX_Drive_01/Foley/Footsteps/',
    url: 'https://actions.google.com/sounds/v1/foley/run_on_gravel.ogg',
    description: 'Fast running footsteps on loose gravel. Sneakers.',
    category: 'Foley',
    tags: ['footsteps', 'gravel', 'run', 'foley', 'movement'],
    duration: 12.0,
    sampleRate: 48000,
    bitDepth: 24,
    channels: 1,
    format: 'wav'
  }
];
