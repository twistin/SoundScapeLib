# Soundscape Gallery

Welcome to the Soundscape Gallery, an immersive web application for professional sound recordists, hobbyists, and audio enthusiasts to upload, organize, and explore high-quality environmental recordings. This application provides a rich, interactive experience, combining an advanced audio player with project management and AI-powered metadata generation.

![Soundscape Gallery Screenshot](https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=1200&auto=format&fit=crop)

---

## ✨ Key Features

- **Project-Based Organization**: Group your soundscape sessions into distinct projects (e.g., "Nature Field Recordings," "Urban Explorations") for better organization.
- **AI-Powered Wizard**: Utilize the Google Gemini API to automatically generate rich metadata (titles, descriptions, locations, equipment suggestions) for your recordings from a simple text prompt.
- **Interactive Soundscape Player**: A custom audio player featuring a dynamic waveform visualization powered by `WaveSurfer.js`.
- **Comprehensive File Management**: Upload multiple attachments (images, audio, notes) to both projects and individual sessions. Features include image thumbnails, inline audio playback, and direct downloads.
- **Interactive Map View**: Visualize the geographic location of all your soundscapes on a global map using Leaflet.js, with clickable markers to jump directly to a session.
- **Collaborative Workspace (Simulated)**: The UI is designed for teamwork, showing project owners and members, laying the groundwork for a future multi-user backend.
- **Responsive Design**: A clean, modern UI built with Tailwind CSS that looks great on devices of all sizes.
- **Dynamic Dashboard**: Easily switch between viewing your projects, recently added soundscapes, or the world map.

---

## 🛠️ Technology Stack

This project is built with a modern, client-side tech stack focused on interactivity and a great user experience.

- **Frontend**:
  - **React**: A JavaScript library for building user interfaces.
  - **TypeScript**: For static typing, improving code quality and maintainability.
  - **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **APIs & Libraries**:
  - **@google/genai (Gemini API)**: Powers the AI-driven metadata generation for new soundscapes.
  - **WaveSurfer.js**: For creating the interactive waveform audio player.
  - **Leaflet.js**: For rendering the interactive world map.

---

## 🚀 Getting Started

This application is designed as a client-side project and can be run using any simple static file server.

**Prerequisites**:
- A modern web browser.
- A local web server. You can use the `live-server` VS Code extension or a simple Python server.

**Setup**:

1.  **API Key**:
    - To use the AI generation features, you must have a Google Gemini API key.
    - This application expects the API key to be available as an environment variable (`process.env.API_KEY`). When deploying to a service like Netlify or Vercel, you would set this in your site's environment variable settings. *For local development, you would need a mechanism to inject this variable.*

2.  **Running Locally**:
    - Clone or download the project files.
    - Start a local web server in the root directory of the project. For example, using Python:
      ```bash
      python3 -m http.server
      ```
    - Open your browser and navigate to the local server's address (e.g., `http://localhost:8000`).

---

## 📁 Project Structure

```
/
├── components/          # Reusable React components
│   ├── icons/           # SVG icon components
│   ├── App.tsx          # Main application component
│   ├── SessionDetail.tsx  # Detail view for a soundscape
│   ├── SessionForm.tsx    # AI-powered new session wizard
│   └── ...
├── data/                # Mock data for development
│   └── mockData.ts
├── types.ts             # TypeScript type definitions
├── index.html           # The main HTML entry point
├── index.tsx            # React application entry point
└── README.md            # This file
```

---

## 🔮 Future Enhancements

While the current version is a fully-featured client-side application, the next logical step is to connect it to a backend service to enable true persistence and collaboration.

- **Backend Integration**: Replace the mock data with a real backend service like **Firebase** or **Supabase** to handle:
  - User Authentication
  - Database (Firestore or Supabase DB)
  - File Storage (Firebase Storage or Supabase Storage)
- **Real-Time Collaboration**: Implement real-time updates so that when one user in a project group makes a change, it instantly reflects for all other members.
- **Advanced Permissions**: Introduce user roles within projects (e.g., Owner, Editor, Viewer).

