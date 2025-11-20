/**
 * Soundscape.io Cloud Functions
 * Handles Audio Processing, AI Metadata Generation, and Similarity Embeddings.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const os = require("os");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();

// Configure FFmpeg with the static binary
ffmpeg.setFfmpegPath(ffmpegPath);

// --- Configuration ---
// Ensure to set this via: firebase functions:config:set gemini.key="YOUR_KEY"
const GEMINI_API_KEY = functions.config().gemini?.key || process.env.API_KEY;

/**
 * 1. FUNCTION: processAndServeAudio
 * Trigger: Callable (HTTP)
 * Description: Downloads audio, applies edits (Trim, Pitch, Norm), uploads result, returns Signed URL.
 */
exports.processAndServeAudio = functions.runWith({
  timeoutSeconds: 300, // 5 minutes for processing
  memory: "2GB",       // RAM for FFmpeg
}).https.onCall(async (data, context) => {
  // 1. Security Check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to process audio."
    );
  }

  const { fileUrl, processingParams } = data;
  // processingParams: { trimStart, trimEnd, pitch, speed, normalize, fadeOut }

  const bucket = admin.storage().bucket();
  const tempFilePath = path.join(os.tmpdir(), uuidv4() + "_input.wav");
  const outputFilePath = path.join(os.tmpdir(), uuidv4() + "_processed.wav");

  try {
    // 2. Parse path from URL or ID (simplified: assuming path is passed or extracted)
    // For this example, we assume fileUrl is a storage path like "users/123/audio.wav"
    const filePath = fileUrl; 

    console.log(`Processing file: ${filePath}`);

    // 3. Download to Temp
    await bucket.file(filePath).download({ destination: tempFilePath });

    // 4. Construct FFmpeg Command
    await new Promise((resolve, reject) => {
      let command = ffmpeg(tempFilePath);

      // Apply Trim
      if (processingParams.trimStart !== undefined) {
        command = command.setStartTime(processingParams.trimStart);
      }
      if (processingParams.trimEnd !== undefined) {
        // Calculate duration if needed, or use setDuration. 
        // Note: setDuration in ffmpeg is relative to start time.
        command = command.setDuration(processingParams.trimEnd - (processingParams.trimStart || 0));
      }

      // Apply Audio Filters
      const audioFilters = [];

      // Pitch & Speed (using atempo for speed, asetrate for pitch/speed combo)
      // Simple implementation: Speed change (preserves pitch)
      if (processingParams.speed && processingParams.speed !== 1.0) {
        audioFilters.push(`atempo=${processingParams.speed}`);
      }
      
      // Pitch Shift (Complex in ffmpeg, standard is 'asetrate' which changes speed too, 
      // or 'rubberband' if installed. We'll simulate pitch by simple resampling for this demo).
      if (processingParams.pitch && processingParams.pitch !== 0) {
         // NOTE: Real pitch shifting without speed change requires complex filters
         // This is a placeholder for the logic.
         console.log("Pitch shift requested (implementation dependent on library availability)");
      }

      // Normalization (Loudness normalization to -14 LUFS or Peak to 0dB)
      if (processingParams.normalize) {
        // Using volumedetect is multi-pass, so we use a simple limiter/gain for speed here
        // or the 'loudnorm' filter.
        audioFilters.push("loudnorm=I=-16:TP=-1.5:LRA=11");
      }

      if (processingParams.fadeOut) {
          // fade=out:st=duration-fadeDur:d=fadeDur
          // Requires knowing exact duration, omitted for brevity in this snippet
      }

      if (audioFilters.length > 0) {
        command = command.audioFilters(audioFilters);
      }

      // Execute
      command
        .format("wav")
        .on("error", (err) => reject(err))
        .on("end", () => resolve())
        .save(outputFilePath);
    });

    // 5. Upload Processed File
    const destinationPath = `processed/${context.auth.uid}/${uuidv4()}.wav`;
    await bucket.upload(outputFilePath, {
      destination: destinationPath,
      metadata: {
        contentType: "audio/wav",
      },
    });

    // 6. Generate Signed URL (Valid for 15 minutes)
    const file = bucket.file(destinationPath);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, 
    });

    // 7. Cleanup
    await fs.remove(tempFilePath);
    await fs.remove(outputFilePath);

    return { downloadUrl: url, path: destinationPath };

  } catch (error) {
    console.error("Audio processing failed:", error);
    // Attempt cleanup
    await fs.remove(tempFilePath).catch(() => {});
    await fs.remove(outputFilePath).catch(() => {});
    
    throw new functions.https.HttpsError(
      "internal",
      "Audio processing failed: " + error.message
    );
  }
});

/**
 * 2. FUNCTION: generateMetadataFromAudio
 * Trigger: Storage (onObjectFinalized)
 * Description: Auto-generates title, description, and tags when a file is uploaded.
 */
exports.generateMetadataFromAudio = functions.storage.object().onFinalize(async (object) => {
  // 1. Filter: Only process audio files in 'uploads/' folder to avoid loops
  const filePath = object.name;
  const contentType = object.contentType;

  if (!contentType.startsWith("audio/") || !filePath.startsWith("uploads/")) {
    return console.log("Skipping non-audio or non-upload file.");
  }

  const bucket = admin.storage().bucket(object.bucket);
  const file = bucket.file(filePath);

  try {
    // 2. Retrieve custom metadata (Lat, Lng, UserID) attached during upload
    const [metadata] = await file.getMetadata();
    const customMetadata = metadata.metadata || {};
    const { lat, lng, userId, projectId } = customMetadata;

    console.log(`Analyzing audio for User: ${userId} at Location: ${lat}, ${lng}`);

    if (!GEMINI_API_KEY) {
      console.error("Gemini API Key not set.");
      return;
    }

    // 3. Prepare Gemini Request
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const prompt = `
      A sound recordist just uploaded a new field recording.
      Context:
      - Location: Latitude ${lat}, Longitude ${lng}
      - Date: ${new Date(object.timeCreated).toISOString()}
      - Project ID: ${projectId || 'General'}
      
      Please generate:
      1. A professional 'title' for this sound effect.
      2. A detailed 'description' of what this environment likely sounds like based on the geography.
      3. A list of 5-10 'tags' (comma separated) including biotic, geophonic, and anthropophonic elements likely present.
      
      Return as JSON.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    const aiResult = JSON.parse(response.text);

    // 4. Update Firestore
    const fileId = path.basename(filePath, path.extname(filePath)); 
    const docRef = admin.firestore().collection("library").doc(fileId);

    await docRef.set({
      id: fileId,
      title: aiResult.title || "Untitled Recording",
      description: aiResult.description || "",
      tags: aiResult.tags || [],
      aiProcessed: true,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      path: filePath,
      userId: userId,
      origin: 'CLOUD',
      location: { lat: Number(lat), lng: Number(lng) },
      url: `gs://${object.bucket}/${filePath}` 
    }, { merge: true });

    console.log("Metadata generated and saved to Firestore.");

  } catch (error) {
    console.error("Error generating metadata:", error);
  }
});

/**
 * 3. FUNCTION: generateAudioEmbeddings
 * Trigger: Callable
 * Description: Simulates generating vector embeddings for similarity search.
 */
exports.generateAudioEmbeddings = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Auth required.");

    const { fileId } = data;
    try {
        const vector = Array.from({length: 128}, () => Math.random());
        await admin.firestore().collection("library").doc(fileId).update({
            embedding: vector,
            hasEmbedding: true
        });
        return { success: true, vectorLength: 128 };
    } catch (error) {
        throw new functions.https.HttpsError("internal", "Embedding failed.");
    }
});

/**
 * 4. FUNCTION: indexLocalFileMetadata
 * Trigger: Callable (HTTP)
 * Description: Receives metadata from the Desktop Bridge app for local files and indexes them.
 * Does NOT upload the file to storage, only saves metadata to Firestore.
 */
exports.indexLocalFileMetadata = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Auth required.");
    }

    const { metadata, localPath } = data;
    
    // Validate inputs
    if (!metadata || !localPath) {
        throw new functions.https.HttpsError("invalid-argument", "Missing metadata or local path.");
    }

    try {
        const fileId = uuidv4();
        const docRef = admin.firestore().collection("library").doc(fileId);

        await docRef.set({
            id: fileId,
            title: metadata.filename, // Use filename as title initially
            filename: metadata.filename,
            description: metadata.description || "Local file indexed via Desktop Bridge",
            tags: metadata.tags || ["local", "indexed"],
            category: metadata.category || "General",
            
            // Technical Metadata
            duration: metadata.duration || 0,
            sampleRate: metadata.sampleRate || 44100,
            bitDepth: metadata.bitDepth || 16,
            channels: metadata.channels || 2,
            format: metadata.format || 'wav',

            // System Metadata
            userId: context.auth.uid,
            origin: 'LOCAL', // Key differentiator
            path: localPath, // Absolute local path (e.g., D:/SFX/...)
            url: '', // No cloud URL available
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            aiStatus: 'COMPLETED' // Assume no AI processing needed for local indexing initially
        });

        return { success: true, fileId: fileId };

    } catch (error) {
        console.error("Local indexing failed:", error);
        throw new functions.https.HttpsError("internal", "Indexing failed.");
    }
});
