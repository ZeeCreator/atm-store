/**
 * Convert file to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Compress image before converting to base64
 */
export function imageToBase64(file: File, maxWidth: number = 800, maxHeight: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          } else {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (quality: 0.7)
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(base64);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Get file size in KB
 */
export function getFileSize(base64: string): number {
  const headerLength = base64.indexOf(',') + 1;
  const payload = base64.substr(headerLength);
  return Math.round((payload.length * 3) / 4) / 1024;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File, maxSizeMB: number = 2): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF.',
    };
  }

  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit.`,
    };
  }

  return { valid: true };
}
