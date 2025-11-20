
import { storage, auth } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a blob to Firebase Storage and returns the download URL.
 */
export const uploadFile = async (
    blob: Blob, 
    path: string, 
    metadata: { [key: string]: string | number } = {}
): Promise<{ url: string; storagePath: string }> => {
    if (!auth.currentUser) throw new Error("User not authenticated");

    const storageRef = ref(storage, path);
    
    // Convert metadata numbers to strings for Storage
    const customMetadata: { [key: string]: string } = {};
    Object.entries(metadata).forEach(([key, value]) => {
        customMetadata[key] = String(value);
    });

    const uploadResult = await uploadBytes(storageRef, blob, {
        customMetadata: {
            ...customMetadata,
            userId: auth.currentUser.uid
        },
        contentType: blob.type
    });

    const url = await getDownloadURL(uploadResult.ref);
    return { url, storagePath: uploadResult.ref.fullPath };
};
