'use client';

import { useState, useRef } from 'react';
import { Icons } from './Icon';
import { imageToBase64, validateImageFile, getFileSize } from '@/lib/imageUtils';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 2,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file, maxSizeMB);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Convert to base64 with compression
      const base64 = await imageToBase64(file);
      
      // Check base64 size (max 500KB per image)
      const sizeKB = getFileSize(base64);
      if (sizeKB > 500) {
        setError(`Image too large after compression (${Math.round(sizeKB)}KB). Max 500KB.`);
        setIsUploading(false);
        return;
      }

      // Add to images array
      const newImages = [...images, base64];
      onImagesChange(newImages);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Image upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleReorderImages = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-headline uppercase tracking-widest text-white/60 mb-2">
          Product Images
        </label>
        <p className="text-white/40 text-xs mb-4">
          Upload up to {maxImages} images (max {maxSizeMB}MB each). First image will be the main image.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => !isUploading && images.length < maxImages && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isUploading 
            ? 'border-white/20 bg-white/5' 
            : images.length >= maxImages
            ? 'border-white/10 bg-white/5 cursor-not-allowed'
            : 'border-outline-variant/30 hover:border-primary-container hover:bg-primary-container/5'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          disabled={isUploading || images.length >= maxImages}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Icons.Spinner className="text-3xl text-primary-container animate-spin" />
            <p className="text-white/60 text-sm">Processing image...</p>
          </div>
        ) : images.length >= maxImages ? (
          <div className="flex flex-col items-center gap-3">
            <Icons.Image className="text-3xl text-white/30" />
            <p className="text-white/40 text-sm">Maximum {maxImages} images reached</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center">
              <Icons.Plus className="text-2xl text-primary-container" />
            </div>
            <div className="text-center">
              <p className="text-white font-headline font-bold uppercase tracking-widest text-sm mb-1">
                Click to upload image
              </p>
              <p className="text-white/40 text-xs">
                JPEG, PNG, WebP (max {maxSizeMB}MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <Icons.ExclamationCircle className="text-sm" />
          <p>{error}</p>
        </div>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="space-y-3">
          <label className="block text-xs font-headline uppercase tracking-widest text-white/60">
            Uploaded Images ({images.length}/{maxImages})
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group aspect-square bg-surface-container-highest rounded-lg overflow-hidden border border-outline-variant/15"
              >
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Main Image Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary-container text-on-primary text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                    Main
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* Reorder Left */}
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderImages(index, 'left');
                      }}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center transition-colors"
                      title="Move left"
                    >
                      <Icons.ChevronLeft className="text-white text-sm" />
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded flex items-center justify-center transition-colors"
                    title="Remove image"
                  >
                    <Icons.Delete className="text-white text-sm" />
                  </button>

                  {/* Reorder Right */}
                  {index < images.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderImages(index, 'right');
                      }}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center transition-colors"
                      title="Move right"
                    >
                      <Icons.ChevronRight className="text-white text-sm" />
                    </button>
                  )}
                </div>

                {/* Image Size */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 text-center">
                  {Math.round(getFileSize(image))}KB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
