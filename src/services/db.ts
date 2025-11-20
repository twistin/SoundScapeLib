
import { db, auth } from '../firebase/config';
import { 
    collection, 
    addDoc, 
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
export const saveSessionToDb = async (session: SoundscapeSession) => {
    if (!auth.currentUser) throw new Error("User not authenticated");

    // We use the 'library' collection for all audio assets to unify the Pro Library
    // Metadata will be updated by the Cloud Function later.
    const docRef = doc(collection(db, 'library')); 
    
    const sessionData = {
        ...session,
        id: docRef.id, // Use generated ID
        userId: auth.currentUser.uid,
        createdAt: Timestamp.now(),
        aiStatus: 'PENDING', // Set initial AI status
        type: 'session'
    };

    await setDoc(docRef, sessionData);
    return docRef.id;
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
                aiStatus: data.aiStatus || 'COMPLETED' // Default to completed if missing
            });
        });
        callback(files);
    });
};
