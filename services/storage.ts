
import { storage, auth } from '../firebase/config';
import { signInAnonymously } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a blob to Firebase Storage and returns the download URL.
 */
export const uploadFile = async (
    blob: Blob, 
    path: string, 
    metadata: { [key: string]: string | number } = {}
): Promise<{ url: string; storagePath: string }> => {
    // Ensure we have a Firebase user (anonymous if not signed in) to satisfy rules.
    if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
        } catch (err) {
            console.error('Anonymous sign-in failed:', err);
        }
    }

    const userId = auth.currentUser?.uid || 'anonymous';

    const storageRef = ref(storage, path);
    
    // Convert metadata numbers to strings for Storage
    const customMetadata: { [key: string]: string } = {};
    Object.entries(metadata).forEach(([key, value]) => {
        customMetadata[key] = String(value);
    });

    let uploadResult;
    try {
        uploadResult = await uploadBytes(storageRef, blob, {
            customMetadata: {
                ...customMetadata,
                userId
            },
            contentType: blob.type
        });
    } catch (err: any) {
        console.error('Firebase Storage upload error:', {
            code: err?.code,
            message: err?.message,
            name: err?.name,
        });
        throw err;
    }

    const url = await getDownloadURL(uploadResult.ref);
    return { url, storagePath: uploadResult.ref.fullPath };
};
