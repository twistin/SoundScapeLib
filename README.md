# 🎧 SoundXcape - Professional Audio Cloud

![Status](https://img.shields.io/badge/Status-Production_Ready-cyan) ![Tech](https://img.shields.io/badge/Stack-React_19_|_Firebase_|_Gemini_AI-blue)

**SoundXcape** (formerly Soundscape.io) is a professional-grade platform designed for sound designers, field recordists, and audio post-production workflows. It bridges the gap between field capture, cloud management, and DAW integration.

The platform allows you to **eXperiment** with generative audio, **eXplore** your library with AI, and **eXport** directly to your timeline.

---

## 🚀 Key Features

### 1. 🌍 X-Capture (Field Mode)
An optimized mobile interface for high-fidelity data capture in the field.
*   **Real-time Geolocation:** Precise GPS tracking with map visualization.
*   **Integrated Recorder:** High-quality audio capture (WAV/WebM) directly from the browser with spectrum visualization.
*   **AI Auto-Tagging (Gemini):** Automatic generation of titles, descriptions, and tags (biotic, geophonic, anthropophonic) based on location context and weather data.
*   **Cloud Sync:** Direct upload to Firebase Storage with immediate metadata indexing.

### 2. 📚 Pro Library & Desktop Bridge
A robust asset manager built for speed.
*   **Desktop Bridge:** Index local files (NAS/Hard Drive) without uploading them, allowing you to manage your entire offline library in the cloud.
*   **Advanced Search:** Filter by sample rate, category, origin (Cloud vs Local), and AI-generated tags.
*   **Similarity Search:** AI-powered vector search to find textures similar to a selected file.
*   **DAW Integration:** "Drag & Drop" functionality to move processed files or local references directly to your Digital Audio Workstation.

### 3. 🎛️ Cloud Audio Editor
A powerful non-destructive editor running in the browser.
*   **Signal Analysis:** Real-time Loudness Meter (LUFS/RMS) and FFT Spectrum Analyzer.
*   **Processing:**
    *   **Trim/Crop:** Precise region editing.
    *   **Normalization:** Peak normalization.
    *   **Fades:** Linear fade-in/out.
*   **Cloud Processing:** Heavy tasks (Pitch Shift, Time Stretch) are offloaded to Cloud Functions using FFmpeg for professional quality.

### 4. ⚡ Generative Tools
*   **Tone Generator:** Synthesize test tones and noise profiles.
*   **Whoosh Creator:** Procedurally generate doppler-style pass-bys and transitions.

---

## 🛠️ Tech Stack

*   **Frontend:** React 19, Tailwind CSS, Wavesurfer.js.
*   **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions).
*   **AI:** Google Gemini API (v2.5 Flash) for metadata and context analysis.
*   **Audio Processing:** Web Audio API (Client-side preview) + FFmpeg (Server-side rendering).

---

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-user/soundxcape.git
    cd soundxcape
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file with your Firebase and Google AI Studio keys:
    ```env
    API_KEY=your_google_gemini_key
    ```
    *Note: Firebase config is located in `src/firebase/config.ts`.*

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## 📖 Usage Guide

### Using X-Capture
1.  Click **"Launch X-Capture"** from the dashboard.
2.  Allow location and microphone access.
3.  Record your environment.
4.  Review the AI-generated metadata and click **"Upload to SoundXcape Cloud"**.

### Using Pro Library
1.  Navigate to **"Pro Library"**.
2.  Use **"Desktop Bridge"** to index local folders.
3.  Select a file to view the **Spectral Analysis**.
4.  Apply edits (Trim, Fade) and click **"Export Processed"** to render a new file.

---

## 📄 License

MIT License.

---
*SoundXcape - eXperiment. eXplore. eXport.*