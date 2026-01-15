// Firebase Storage service functions
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  UploadResult,
  uploadBytesResumable,
} from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a file to Firebase Storage with progress tracking
 */
export const uploadFile = async (
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; error: Error | null }> => {
  try {
    console.log('Starting upload to path:', path);
    console.log('File details:', { name: file.name, type: file.type, size: file.size });
    
    const storageRef = ref(storage, path);
    
    // Use uploadBytesResumable for progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload progress:', progress.toFixed(0) + '%');
          onProgress?.(progress);
        },
        (error) => {
          console.error('Upload error:', error.code, error.message);
          resolve({ url: '', error: error as Error });
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Upload successful, URL:', url);
            resolve({ url, error: null });
          } catch (urlError) {
            console.error('Error getting download URL:', urlError);
            resolve({ url: '', error: urlError as Error });
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload initialization error:', error);
    return { url: '', error: error as Error };
  }
};

/**
 * Upload an avatar for a user
 */
export const uploadAvatar = async (
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; error: Error | null }> => {
  // Generate unique filename with timestamp to avoid caching issues
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const path = `avatars/${userId}/avatar_${timestamp}.${fileExt}`;
  return uploadFile(path, file, onProgress);
};

/**
 * Get the download URL for a file
 */
export const getFileUrl = async (path: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (path: string): Promise<boolean> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};
