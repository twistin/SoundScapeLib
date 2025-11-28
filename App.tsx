import React, { useState, useEffect, useMemo } from 'react';
import { SoundscapeSession, AttachedFile, Project, User } from './types';
import { mockSessions, mockProjects, mockUsers } from './data/mockData';
import SessionDetail from './components/SessionDetail';
import SessionForm from './components/SessionForm';
import { SessionFormData } from './components/SoundscapeDataForm';
import LandingPage from './components/LandingPage';
import SessionCard from './components/SessionCard';
import ProjectCard from './components/ProjectCard';
import Map from './components/Map';
import PlusIcon from './components/icons/PlusIcon';
import SearchIcon from './components/icons/SearchIcon';
import FolderIcon from './components/icons/FolderIcon';
import MapIcon from './components/icons/MapIcon';
import RewindIcon from './components/icons/RewindIcon';
import ProjectCardSkeleton from './components/ProjectCardSkeleton';
import SessionCardSkeleton from './components/SessionCardSkeleton';
import Modal from './components/Modal';
import FileManager from './components/FileManager';
import NewProjectCard from './components/NewProjectCard';
import UsersIcon from './components/icons/UsersIcon';
import FieldMode from './components/FieldMode'; 
import MicrophoneIcon from './components/icons/MicrophoneIcon'; 
import LibraryMode from './components/LibraryMode'; // New Import
import WaveformIcon from './components/icons/WaveformIcon'; // New Import

type View = 'landing' | 'dashboard' | 'detail' | 'form' | 'field' | 'library'; // Added library
type DashboardTab = 'projects' | 'recents' | 'map';

// Simulate a logged-in user
const MOCK_CURRENT_USER = mockUsers['user2'];

function App() {
  const [view, setView] = useState<View>('landing');
  const [sessions, setSessions] = useState<SoundscapeSession[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSession, setSelectedSession] = useState<SoundscapeSession | null>(null);
  const [formInitialData, setFormInitialData] = useState<SoundscapeSession | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('projects');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gallerySource, setGallerySource] = useState<DashboardTab>('projects');
  
  // Modals State
  const [managingFilesForSession, setManagingFilesForSession] = useState<SoundscapeSession | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectError, setNewProjectError] = useState<string>('');
  
  const [defaultProjectForNewSession, setDefaultProjectForNewSession] = useState<string | null>(null);


  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
        setSessions(mockSessions);
        setProjects(mockProjects);
        setIsLoading(false);
    }, 1500); // Simulate network request
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => setView('dashboard');

  const handleSelectSession = (session: SoundscapeSession) => {
    setGallerySource(activeTab);
    setSelectedSession(session);
    setView('detail');
  };
  
  const handleSelectSessionFromMap = (sessionId: string) => {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
          setGallerySource('map');
          setSelectedSession(session);
          setView('detail');
      }
  }

  const handleBack = () => {
    setSelectedSession(null);
    setView('dashboard');
  };

  const handleNewSession = (projectName?: string) => {
    setDefaultProjectForNewSession(projectName || null);
    setFormInitialData(null);
    setView('form');
  };

  const handleEditSession = (session: SoundscapeSession) => {
    setFormInitialData(session);
    setDefaultProjectForNewSession(null);
    setView('form');
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this soundscape?')) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setView('dashboard');
      setSelectedSession(null);
    }
  };

  const handleFormCancel = () => {
    if (formInitialData) {
      setView('detail');
    } else {
      setView('dashboard');
    }
    setFormInitialData(null);
    setDefaultProjectForNewSession(null);
  };
  
  const handleFormSubmit = (formData: SessionFormData) => {
    if (formInitialData) { // Editing existing session
      let imageUrl = formData.imageUrl || (formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl);
      let audioUrl = formData.audioUrl || (formData.audioFile ? URL.createObjectURL(formData.audioFile) : formData.audioUrl);

      // Ensure local files get proper blob: URLs if upload failed or URL is missing scheme
      if (formData.imageFile && imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:')) {
        imageUrl = URL.createObjectURL(formData.imageFile);
      }
      if (formData.audioFile && audioUrl && !audioUrl.startsWith('http') && !audioUrl.startsWith('blob:')) {
        audioUrl = URL.createObjectURL(formData.audioFile);
      }

      const updatedSession: SoundscapeSession = {
        ...formInitialData,
        title: formData.title,
        author: formData.author,
        project: formData.project,
        description: formData.description,
        equipment: formData.equipment,
        soundType: formData.soundType as SoundscapeSession['soundType'],
        date: formData.date,
        location: {
          name: formData.locationName,
          lat: formInitialData.location.lat,
          lng: formInitialData.location.lng,
        },
        imageUrl,
        audioUrl,
      };
      setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
      setSelectedSession(updatedSession);
      setView('detail');
    } else { // Creating new session
      let imageUrl = formData.imageUrl || (formData.imageFile ? URL.createObjectURL(formData.imageFile) : 'https://picsum.photos/seed/new/800/600');
      let audioUrl = formData.audioUrl || (formData.audioFile ? URL.createObjectURL(formData.audioFile) : '');

      if (formData.imageFile && imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:')) {
        imageUrl = URL.createObjectURL(formData.imageFile);
      }
      if (formData.audioFile && audioUrl && !audioUrl.startsWith('http') && !audioUrl.startsWith('blob:')) {
        audioUrl = URL.createObjectURL(formData.audioFile);
      }

      const newSession: SoundscapeSession = {
        id: new Date().getTime().toString(),
        title: formData.title,
        author: formData.author,
        project: formData.project,
        description: formData.description,
        equipment: formData.equipment,
        soundType: formData.soundType as SoundscapeSession['soundType'],
        date: formData.date,
        location: {
          name: formData.locationName,
          lat: 40.7128 + (Math.random() - 0.5) * 10,
          lng: -74.0060 + (Math.random() - 0.5) * 10,
        },
        imageUrl,
        audioUrl,
        attachments: [],
        privacy: 'private'
      };
      setSessions(prev => [newSession, ...prev]);
      if (!projects.some(p => p.name === newSession.project)) {
         const newProject: Project = {
            name: newSession.project,
            attachments: [],
            owner: MOCK_CURRENT_USER,
            members: [MOCK_CURRENT_USER],
         };
        setProjects(prev => [...prev, newProject]);
      }
      setSelectedSession(newSession);
      setView('detail');
    }
    setFormInitialData(null);
    setDefaultProjectForNewSession(null);
  };
  
  const handleFieldSessionSave = (session: SoundscapeSession) => {
      setSessions(prev => [session, ...prev]);
      if (!projects.some(p => p.name === session.project)) {
         const newProject: Project = {
            name: session.project,
            attachments: [],
            owner: MOCK_CURRENT_USER,
            members: [MOCK_CURRENT_USER],
         };
        setProjects(prev => [...prev, newProject]);
      }
      setSelectedSession(session);
      setView('detail');
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setNewProjectError('Project name cannot be empty.');
      return;
    }
    if (projects.some(p => p.name.toLowerCase() === newProjectName.trim().toLowerCase())) {
      setNewProjectError('A project with this name already exists.');
      return;
    }

    const newProject: Project = {
      name: newProjectName.trim(),
      attachments: [],
      owner: MOCK_CURRENT_USER,
      members: [MOCK_CURRENT_USER]
    };
    setProjects(prev => [newProject, ...prev]);
    handleCloseNewProjectModal();
    setSelectedProject(newProject.name);
  };

  const getFileType = (file: File): AttachedFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'other';
  };
  
  const handleSessionFileUpload = (sessionId: string, file: File) => {
    const newAttachment: AttachedFile = {
      id: Date.now().toString(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: getFileType(file),
    };

    let updatedSession: SoundscapeSession | null = null;
    const newSessions = sessions.map(s => {
      if (s.id === sessionId) {
        updatedSession = { ...s, attachments: [...s.attachments, newAttachment] };
        return updatedSession;
      }
      return s;
    });

    setSessions(newSessions);
    if (selectedSession?.id === sessionId && updatedSession) {
      setSelectedSession(updatedSession);
    }
    if (managingFilesForSession?.id === sessionId && updatedSession) {
      setManagingFilesForSession(updatedSession);
    }
  };

  const handleSessionFileDelete = (sessionId: string, attachmentId: string) => {
    let updatedSession: SoundscapeSession | null = null;
    const newSessions = sessions.map(s => {
      if (s.id === sessionId) {
        updatedSession = { ...s, attachments: s.attachments.filter(att => att.id !== attachmentId) };
        return updatedSession;
      }
      return s;
    });
    
    setSessions(newSessions);
    if (selectedSession?.id === sessionId && updatedSession) {
      setSelectedSession(updatedSession);
    }
    if (managingFilesForSession?.id === sessionId && updatedSession) {
      setManagingFilesForSession(updatedSession);
    }
  };

  const handleProjectFileUpload = (projectName: string, file: File) => {
    const newAttachment: AttachedFile = {
      id: Date.now().toString(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: getFileType(file),
    };
    setProjects(projects.map(p => 
      p.name === projectName 
        ? { ...p, attachments: [...p.attachments, newAttachment] }
        : p
    ));
  };

  const handleProjectFileDelete = (projectName: string, attachmentId: string) => {
     setProjects(projects.map(p => 
      p.name === projectName 
        ? { ...p, attachments: p.attachments.filter(att => att.id !== attachmentId) }
        : p
    ));
  };


  const handleOpenFileManager = (session: SoundscapeSession) => setManagingFilesForSession(session);
  const handleCloseFileManager = () => setManagingFilesForSession(null);

  const handleOpenNewProjectModal = () => setIsNewProjectModalOpen(true);
  const handleCloseNewProjectModal = () => {
    setIsNewProjectModalOpen(false);
    setNewProjectName('');
    setNewProjectError('');
  };
  
  const projectsWithCounts = useMemo(() => {
    const sessionCounts = sessions.reduce((acc, session) => {
      acc[session.project] = (acc[session.project] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return projects.map(p => ({
        ...p,
        count: sessionCounts[p.name] || 0
    })).sort((a,b) => a.name.localeCompare(b.name));
  }, [sessions, projects]);

  const filteredSessions = useMemo(() => {
    if (!searchTerm) return sessions;
    return sessions.filter(session => 
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sessions, searchTerm]);
  
  const recentSessions = useMemo(() => {
     return [...filteredSessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredSessions]);

  const projectSessions = useMemo(() => {
    if (!selectedProject) return [];
    return filteredSessions.filter(s => s.project === selectedProject);
  }, [filteredSessions, selectedProject]);


  const renderDashboard = () => (
    <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                 <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                 </svg>
             </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Sound<span className="text-cyan-400">X</span>cape</h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto flex-col sm:flex-row">
          <button 
            onClick={() => setView('library')}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-lg border border-slate-600 flex items-center gap-2 transition-colors"
          >
            <WaveformIcon className="w-5 h-5 text-cyan-400" />
            <span>Pro Library</span>
          </button>

          <button 
            onClick={() => setView('field')}
            className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-cyan-500/25 flex items-center gap-2 transform transition-all hover:scale-105 w-full sm:w-auto justify-center border border-white/10"
          >
            <MicrophoneIcon className="w-5 h-5 group-hover:animate-pulse" />
            <span>Launch X-Capture</span>
          </button>

          <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-auto group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors"/>
            <input 
              type="text" 
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 w-full sm:w-72 transition-all"
            />
          </div>
           <div className="flex items-center gap-3 w-full sm:w-auto justify-end pl-4 border-l border-slate-800/50">
              <div className="text-right hidden sm:block">
                  <p className="font-semibold text-white leading-tight text-sm">{MOCK_CURRENT_USER.name}</p>
                  <p className="text-xs text-slate-400 leading-tight">Pro Member</p>
              </div>
              <img src={MOCK_CURRENT_USER.avatarUrl} alt={MOCK_CURRENT_USER.name} className="w-10 h-10 rounded-full border-2 border-slate-700 shadow-sm"/>
          </div>
        </div>
      </header>

      <nav className="mb-8">
        <div className="flex gap-2 p-1 bg-slate-800/50 backdrop-blur-md rounded-xl inline-flex border border-slate-700/50">
          { (['projects', 'recents', 'map'] as DashboardTab[]).map(tab => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedProject(null); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab 
                  ? 'bg-gradient-to-br from-slate-700 to-slate-600 text-white shadow-lg ring-1 ring-white/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab === 'projects' && <FolderIcon className={`w-5 h-5 ${activeTab === tab ? 'text-cyan-400' : ''}`} />}
              {tab === 'recents' && <RewindIcon className={`w-5 h-5 ${activeTab === tab ? 'text-purple-400' : ''}`} />}
              {tab === 'map' && <MapIcon className={`w-5 h-5 ${activeTab === tab ? 'text-green-400' : ''}`} />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="animate-fade-in pb-20 min-h-[60vh]">
        {activeTab === 'projects' && (
          <div>
            {selectedProject ? (() => {
                const projectData = projects.find(p => p.name === selectedProject);
                return (
                  <div className="animate-slide-up">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                             <div className="flex items-center gap-3 mb-1">
                                <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-white transition-colors">
                                    Projects 
                                </button>
                                <span className="text-slate-600">/</span>
                                <h2 className="text-3xl font-bold text-white tracking-tight">{selectedProject}</h2>
                             </div>
                             <p className="text-slate-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block"></span>
                                Owned by {projectData?.owner.name}
                             </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                        <div className="md:col-span-2 h-full">
                             {projectData && (
                                <FileManager
                                attachments={projectData.attachments}
                                onFileUpload={(file) => handleProjectFileUpload(projectData.name, file)}
                                onFileDelete={(attachmentId) => handleProjectFileDelete(projectData.name, attachmentId)}
                                />
                            )}
                        </div>
                        <div className="h-full">
                             {projectData && (
                                <div className="glass-panel p-6 rounded-xl h-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <UsersIcon className="w-5 h-5 text-cyan-400"/>
                                            Team
                                        </h3>
                                        <button className="text-xs bg-slate-700/50 hover:bg-slate-600 text-white font-semibold py-1.5 px-3 rounded-md transition-colors border border-slate-600">Invite</button>
                                    </div>
                                    <div className="space-y-4">
                                        {projectData.members.map(member => (
                                            <div key={member.id} className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-slate-700/30 transition">
                                                <div className="relative">
                                                    <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-cyan-500/50 transition-all"/>
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{member.name}</p>
                                                    <p className="text-xs text-slate-400">{member.id === projectData.owner.id ? 'Owner' : 'Editor'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-white">Soundscapes</h3>
                        <button 
                            onClick={() => handleNewSession(selectedProject)}
                            className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-all border border-cyan-500/20 hover:border-cyan-500/50"
                        >
                            <PlusIcon className="w-5 h-5"/>
                            <span className="hidden sm:inline">Add Soundscape</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {projectSessions.length > 0 ? projectSessions.map(session => (
                        <SessionCard 
                          key={session.id} 
                          session={session} 
                          onSelect={handleSelectSession} 
                          onManageFiles={handleOpenFileManager}
                        />
                      )) : (
                          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-800/20">
                              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <FolderIcon className="w-8 h-8 text-slate-600" />
                              </div>
                              <p className="text-slate-400">No soundscapes recorded yet.</p>
                              <button onClick={() => handleNewSession(selectedProject)} className="text-cyan-400 font-bold mt-2 hover:underline">Create your first recording</button>
                          </div>
                      )}
                    </div>
                  </div>
                )
              })()
             : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-slide-up">
                 {isLoading 
                    ? Array.from({ length: 5 }).map((_, i) => <ProjectCardSkeleton key={i} />)
                    : (
                        <>
                            <NewProjectCard onClick={handleOpenNewProjectModal} />
                            {projectsWithCounts.map(project => (
                                <ProjectCard key={project.name} project={project} onSelect={setSelectedProject} />
                            ))}
                        </>
                    )
                 }
              </div>
            )}
          </div>
        )}
        {activeTab === 'recents' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-up">
             {isLoading 
              ? Array.from({ length: 8 }).map((_, i) => <SessionCardSkeleton key={i} />)
              : recentSessions.length > 0 ? recentSessions.map(session => (
                  <SessionCard key={session.id} session={session} onSelect={handleSelectSession} />
                )) : <p className="text-slate-400">No soundscapes found.</p>
            }
          </div>
        )}
        {activeTab === 'map' && (
            <div className="h-[calc(100vh-240px)] rounded-xl overflow-hidden border border-slate-700 relative shadow-2xl animate-fade-in">
                <Map sessions={filteredSessions} onMarkerClick={handleSelectSessionFromMap} showUserLocation={true} />
                <div className="absolute bottom-8 right-8 z-[400]">
                    <button 
                    onClick={() => setView('field')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full p-4 shadow-lg shadow-cyan-500/40 transition-all hover:scale-110 hover:rotate-3"
                    title="Start Field Mode"
                    >
                        <MicrophoneIcon className="w-8 h-8" />
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case 'landing':
        return <LandingPage onEnter={handleEnter} />;
      case 'detail':
        return selectedSession && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <SessionDetail 
              session={selectedSession} 
              onBack={handleBack} 
              onEdit={handleEditSession} 
              onDelete={handleDeleteSession}
              gallerySource={gallerySource}
              onFileUpload={(file) => handleSessionFileUpload(selectedSession.id, file)}
              onFileDelete={(attachmentId) => handleSessionFileDelete(selectedSession.id, attachmentId)}
            />
          </div>
        );
      case 'form':
        return (
          <div className="p-4 sm:p-6 lg:p-8">
            <SessionForm 
              onSubmit={handleFormSubmit} 
              onCancel={handleFormCancel} 
              initialData={formInitialData} 
              projects={projectsWithCounts.map(p => p.name)}
              defaultProject={defaultProjectForNewSession}
            />
          </div>
        );
      case 'field':
        return (
            <FieldMode 
                onSaveSession={handleFieldSessionSave}
                onCancel={() => setView('dashboard')}
                currentUser={MOCK_CURRENT_USER}
                projects={projectsWithCounts.map(p => p.name)}
            />
        );
      case 'library':
        return (
           <div className="h-screen flex flex-col">
               <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-800 rounded-lg">
                         <WaveformIcon className="w-6 h-6 text-cyan-400" />
                       </div>
                       <div>
                         <h2 className="text-xl font-bold text-white">Pro Library</h2>
                         <p className="text-xs text-slate-400">Asset Management & Design</p>
                       </div>
                   </div>
                   <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-white text-sm font-medium">
                       Back to Dashboard
                   </button>
               </div>
               <div className="flex-grow overflow-hidden">
                   <LibraryMode />
               </div>
           </div>
        );
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen text-slate-100 font-sans">
      {renderContent()}

      <Modal 
        isOpen={!!managingFilesForSession} 
        onClose={handleCloseFileManager} 
        title={`Manage Files for "${managingFilesForSession?.title}"`}
      >
        {managingFilesForSession && (
            <FileManager
              attachments={managingFilesForSession.attachments}
              onFileUpload={(file) => handleSessionFileUpload(managingFilesForSession.id, file)}
              onFileDelete={(attachmentId) => handleSessionFileDelete(managingFilesForSession.id, attachmentId)}
            />
        )}
      </Modal>

      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={handleCloseNewProjectModal}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject}>
            <div className="space-y-5">
                <div>
                    <label htmlFor="newProjectName" className="block text-sm font-bold text-slate-300 mb-2">
                        Project Name
                    </label>
                    <input
                        type="text"
                        id="newProjectName"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                        placeholder="e.g., Coastal Recordings 2024"
                        autoFocus
                    />
                     {newProjectError && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                        <span className="block w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                         {newProjectError}
                     </p>}
                </div>
                 <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                    <button type="button" onClick={handleCloseNewProjectModal} className="text-slate-400 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105">
                        Create Project
                    </button>
                </div>
            </div>
        </form>
      </Modal>
    </div>
  );
}

export default App;
