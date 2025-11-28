
import { db, auth } from '../firebase/config';
import { 
    collection, 
    doc, 
    setDoc, 
    query, 
    where, 
    onSnapshot,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { AudioFile, SoundscapeSession } from '../types';

/**
 * Saves a new field recording session to Firestore.
 */
export const saveSessionToDb = async (session: SoundscapeSession): Promise<SoundscapeSession> => {
    if (!auth.currentUser) throw new Error("User not authenticated");

    // We use the 'library' collection for all audio assets to unify the Pro Library
    // Metadata will be updated by the Cloud Function later.
    const docRef = doc(collection(db, 'library')); 
    
    const sessionData: SoundscapeSession = {
        ...session,
        id: docRef.id, // Use generated ID
        aiStatus: 'PENDING', // Set initial AI status
    };

    // We need to add fields that are not in SoundscapeSession for the DB query
    const dataToSave = {
        ...sessionData,
        userId: auth.currentUser.uid,
        createdAt: Timestamp.now(),
        type: 'session'
    }

    await setDoc(docRef, dataToSave);
    return sessionData; // Return the object with the new ID
};

/**
 * Subscribes to the user's audio library with real-time updates.
 */
export const subscribeToLibrary = (
    callback: (files: AudioFile[]) => void
) => {
    if (!auth.currentUser) return () => {};

    const q = query(
        collection(db, 'library'),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const files: AudioFile[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Map Firestore data to AudioFile interface
            files.push({
                id: doc.id,
                filename: data.title || data.filename || 'Untitled',
                path: data.path || '',
                url: data.url || '',
                description: data.description || '',
                category: data.category || (data.tags?.biotic?.length ? 'Nature' : 'General'),
                tags: [
                    ...(data.tags?.biotic || []), 
                    ...(data.tags?.geophonic || []), 
                    ...(data.tags?.anthropophonic || [])
                ],
                duration: data.duration || 0,
                sampleRate: data.sampleRate || 48000,
                bitDepth: data.bitDepth || 16,
                channels: data.channels || 2,
                format: 'wav',
                origin: data.origin || 'CLOUD',
                aiStatus: data.aiStatus || 'COMPLETED', // Default to completed if missing
                processing: data.processing
            });
        });
        callback(files);
    });
};
