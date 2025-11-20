
import { functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';

/**
 * Calls the backend to process audio with FFmpeg.
 * @param fileUrl The path or URL of the file in storage.
 * @param params Edit parameters (trim, pitch, etc.)
 */
export const processAudioOnServer = async (
  fileUrl: string, 
  params: { 
    trimStart?: number; 
    trimEnd?: number; 
    pitch?: number; 
    speed?: number; 
    normalize?: boolean; 
    fadeOut?: boolean;
  }
) => {
  try {
    const processFunc = httpsCallable(functions, 'processAndServeAudio');
    const result = await processFunc({ fileUrl, processingParams: params });
    return result.data as { downloadUrl: string; path: string };
  } catch (error) {
    console.error("Server processing error:", error);
    throw error;
  }
};

/**
 * Wrapper for processAudioOnServer to match request naming.
 */
export const getProcessedAudioUrl = async (
    fileId: string, 
    fileStoragePath: string, 
    processingParams: {
        trimStart?: number;
        trimEnd?: number;
        pitch?: number;
        speed?: number;
        normalize?: boolean;
    }
) => {
    return await processAudioOnServer(fileStoragePath, processingParams);
};

/**
 * Triggers embedding generation manually (if not handled by trigger).
 */
export const generateEmbeddings = async (fileId: string) => {
    const embedFunc = httpsCallable(functions, 'generateAudioEmbeddings');
    return await embedFunc({ fileId });
};

/**
 * Registers metadata for a local file via the Desktop Bridge.
 * Does not upload audio, only indexes metadata.
 */
export const registerLocalFile = async (data: { 
    metadata: {
        filename: string;
        description?: string;
        tags?: string[];
        category?: string;
        duration?: number;
        sampleRate?: number;
        bitDepth?: number;
        channels?: number;
        format?: string;
    }, 
    localPath: string 
}) => {
    const indexFunc = httpsCallable(functions, 'indexLocalFileMetadata');
    return await indexFunc(data);
};
