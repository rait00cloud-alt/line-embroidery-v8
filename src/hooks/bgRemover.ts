
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';


export const removeBackground = async (
  file: File,
  options?: {
    progress?: (key: string, current: number, total: number) => void;
    debug?: boolean;
  }
): Promise<Blob> => {
  try {
    const blob = await imglyRemoveBackground(file, {
      progress: options?.progress,
      debug: options?.debug,
    });

    return blob;
  } catch (error) {
    console.error('Background removal failed:', error);
    throw error;
  }
};


export const removeBackgroundWithProgress = async (
  file: File,
  onProgress: (percent: number) => void
): Promise<Blob> => {
  return await imglyRemoveBackground(file, {
    progress: (key, current, total) => {
      const percent = Math.round((current / total) * 100);
      onProgress(percent);
    },
  });
};

export const removeBackgroundToDataURL = async (
  file: File
): Promise<string> => {
  const blob = await removeBackground(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const removeBackgroundToObjectURL = async (
  file: File
): Promise<string> => {
  const blob = await removeBackground(file);
  return URL.createObjectURL(blob);
};