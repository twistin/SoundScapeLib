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

type View = 'landing' | 'dashboard' | 'detail' | 'form';
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
        imageUrl: formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl,
        audioUrl: formData.audioFile ? URL.createObjectURL(formData.audioFile) : formData.audioUrl,
      };
      setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
      setSelectedSession(updatedSession);
      setView('detail');
    } else { // Creating new session
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
        imageUrl: formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl || 'https://picsum.photos/seed/new/800/600',
        audioUrl: formData.audioFile ? URL.createObjectURL(formData.audioFile) : formData.audioUrl || '',
        attachments: [],
      };
      setSessions(prev => [newSession, ...prev]);
      // If a project with this name doesn't exist, create it.
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
    setSelectedProject(newProject.name); // Navigate to the new project
  };

  const getFileType = (file: File): AttachedFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'other';
  };
  
  // Handlers for Session-level attachments
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

  // Handlers for Project-level attachments
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
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-extrabold text-white">Soundscape Library</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
            <input 
              type="text" 
              placeholder="Search soundscapes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-64"
            />
          </div>
           <div className="flex items-center gap-3">
              <img src={MOCK_CURRENT_USER.avatarUrl} alt={MOCK_CURRENT_USER.name} className="w-10 h-10 rounded-full border-2 border-slate-600"/>
              <div>
                  <p className="font-semibold text-white leading-tight">{MOCK_CURRENT_USER.name}</p>
                  <p className="text-xs text-slate-400 leading-tight">Team Member</p>
              </div>
          </div>
        </div>
      </header>

      <nav className="mb-6">
        <div className="flex border-b border-slate-700">
          { (['projects', 'recents', 'map'] as DashboardTab[]).map(tab => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedProject(null); }}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              {tab === 'projects' && <FolderIcon className="w-5 h-5" />}
              {tab === 'recents' && <RewindIcon className="w-5 h-5" />}
              {tab === 'map' && <MapIcon className="w-5 h-5" />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="animate-fade-in">
        {activeTab === 'projects' && (
          <div>
            {selectedProject ? (() => {
                const projectData = projects.find(p => p.name === selectedProject);
                return (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                             <h2 className="text-3xl font-bold text-white">{selectedProject}</h2>
                             <p className="text-slate-400">Owned by {projectData?.owner.name}</p>
                        </div>
                      <button onClick={() => setSelectedProject(null)} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                        Back to All Projects
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="md:col-span-2">
                             {projectData && (
                                <FileManager
                                attachments={projectData.attachments}
                                onFileUpload={(file) => handleProjectFileUpload(projectData.name, file)}
                                onFileDelete={(attachmentId) => handleProjectFileDelete(projectData.name, attachmentId)}
                                />
                            )}
                        </div>
                        <div>
                             {projectData && (
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 h-full">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <UsersIcon className="w-6 h-6"/>
                                            Project Members
                                        </h3>
                                        <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1 px-2 rounded-md transition-colors">Invite</button>
                                    </div>
                                    <div className="space-y-3">
                                        {projectData.members.map(member => (
                                            <div key={member.id} className="flex items-center gap-3">
                                                <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full"/>
                                                <div>
                                                    <p className="font-semibold text-slate-200">{member.name}</p>
                                                    <p className="text-xs text-slate-400">{member.id === projectData.owner.id ? 'Owner' : 'Member'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                        <h3 className="text-2xl font-bold text-white">Soundscapes</h3>
                        <button 
                            onClick={() => handleNewSession(selectedProject)}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors flex-shrink-0"
                        >
                            <PlusIcon className="w-5 h-5"/>
                            <span className="hidden sm:inline">Add New Soundscape</span>
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
                      )) : <p className="text-slate-400 col-span-full py-8 text-center">No soundscapes in this project yet. Click 'Add New Soundscape' to get started.</p>}
                    </div>
                  </div>
                )
              })()
             : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {isLoading 
              ? Array.from({ length: 8 }).map((_, i) => <SessionCardSkeleton key={i} />)
              : recentSessions.length > 0 ? recentSessions.map(session => (
                  <SessionCard key={session.id} session={session} onSelect={handleSelectSession} />
                )) : <p className="text-slate-400">No soundscapes found.</p>
            }
          </div>
        )}
        {activeTab === 'map' && (
            <div className="h-[calc(100vh-250px)] rounded-lg overflow-hidden border-2 border-slate-700">
                <Map sessions={filteredSessions} onMarkerClick={handleSelectSessionFromMap}/>
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
          <div className="p-4 sm:p-6 lg:p-8">
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
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white font-sans">
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
            <div className="space-y-4">
                <div>
                    <label htmlFor="newProjectName" className="block text-sm font-medium text-slate-300 mb-1">
                        Project Name
                    </label>
                    <input
                        type="text"
                        id="newProjectName"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                        placeholder="e.g., Coastal Recordings"
                        autoFocus
                    />
                     {newProjectError && <p className="text-red-400 text-sm mt-2">{newProjectError}</p>}
                </div>
                 <div className="flex justify-end gap-4 pt-2">
                    <button type="button" onClick={handleCloseNewProjectModal} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-lg transition-colors">
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