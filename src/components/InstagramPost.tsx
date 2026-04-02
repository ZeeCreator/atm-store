'use client';

import { useEffect, useState } from 'react';

interface InstagramPostProps {
  url: string;
}

export default function InstagramPost({ url }: InstagramPostProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [isVideo, setIsVideo] = useState(false);
  const isReel = url.includes('/reel/');

  useEffect(() => {
    const extractMedia = () => {
      // Create hidden container for Instagram embed
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed; top:-9999px; left:-9999px; width:540px; visibility:hidden;';
      document.body.appendChild(container);

      // Create Instagram blockquote
      const blockquote = document.createElement('blockquote');
      blockquote.className = 'instagram-media';
      blockquote.setAttribute('data-instgrm-permalink', url);
      blockquote.setAttribute('data-instgrm-version', '14');
      container.appendChild(blockquote);

      // Load Instagram script
      const loadScript = () => {
        if (!window.instgrm) {
          const script = document.createElement('script');
          script.src = '//www.instagram.com/embed.js';
          script.async = true;
          script.defer = true;
          document.body.appendChild(script);
          return script;
        }
        return null;
      };

      const script = loadScript();

      const processAfterLoad = () => {
        setTimeout(() => {
          // Try multiple methods to extract media

          // Method 1: Find video element (for reels/videos)
          const video = container.querySelector('video');
          if (video) {
            setIsVideo(true);
            // Try to get poster/thumbnail from video
            if (video.poster) {
              setMediaUrl(video.poster);
            } else if (video.querySelector('img')) {
              const videoImg = video.querySelector('img');
              if (videoImg && videoImg.src) {
                setMediaUrl(videoImg.src);
              }
            }
          }

          // Method 2: Find image element (for photos or video thumbnail)
          const img = container.querySelector('img');
          if (img && img.src && !img.src.includes('static/images')) {
            setMediaUrl(img.src);
            // Check if this is a video thumbnail
            const playButton = container.querySelector('[aria-label="Video"]');
            if (playButton) {
              setIsVideo(true);
            }
          }

          // Method 3: Check for video indicators in the embed
          const videoIndicator = container.querySelector('[data-testid="video-indicator"]');
          if (videoIndicator) {
            setIsVideo(true);
          }

          // Cleanup
          setTimeout(() => {
            document.body.removeChild(container);
          }, 100);
          
          setIsLoading(false);
        }, 2500);
      };

      if (script) {
        script.onload = () => {
          if (window.instgrm && window.instgrm.Embeds) {
            window.instgrm.Embeds.process();
            processAfterLoad();
          }
        };
      } else if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
        processAfterLoad();
      }
    };

    extractMedia();

    // Fallback timeout
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [url]);

  return (
    <div className="relative group w-full max-w-[340px]">
      {/* Hidden Instagram Embed (for functionality) */}
      <div className="hidden">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
        />
      </div>

      {/* Custom Card */}
      <div className="relative bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/20 hover:border-primary-container/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-container/20">
        {/* Media Container */}
        <div className="aspect-square relative overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/30 via-surface-container to-pink-900/30">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-container border-t-transparent"></div>
            </div>
          )}

          {/* Image Display */}
          {!isLoading && mediaUrl && !isVideo && (
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${mediaUrl})` }}
            />
          )}

          {/* Video with Thumbnail */}
          {!isLoading && mediaUrl && isVideo && (
            <>
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${mediaUrl})` }}
              />
              {/* Video Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-play text-black text-4xl ml-1"></i>
                </div>
              </div>
            </>
          )}

          {/* Reel without Thumbnail (Fallback) */}
          {!isLoading && !mediaUrl && isReel && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
              <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <i className="fa-solid fa-play text-white text-5xl ml-2 drop-shadow-lg"></i>
              </div>
            </div>
          )}

          {/* Fallback - No Media */}
          {!isLoading && !mediaUrl && !isReel && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
              <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
                <i className="fa-brands fa-instagram text-white text-6xl drop-shadow-lg"></i>
              </div>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

          {/* Video Badge */}
          {isVideo && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
              <i className="fa-solid fa-play text-white text-xs"></i>
              <span className="text-white text-xs font-bold uppercase tracking-wider">Video</span>
            </div>
          )}

          {/* Post Type Badge */}
          {isReel && !isVideo && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
              <i className="fa-solid fa-play text-white text-xs"></i>
              <span className="text-white text-xs font-bold uppercase tracking-wider">Reels</span>
            </div>
          )}

          {/* Bottom Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg border border-white/20">
                <i className="fa-solid fa-motorcycle text-white text-sm"></i>
              </div>
              <span className="text-white text-sm font-bold truncate max-w-[140px] drop-shadow-lg">
                @atmmadiun
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <button className="hover:text-pink-500 transition-colors">
                <i className="fa-regular fa-heart text-lg"></i>
              </button>
              <button className="hover:text-blue-400 transition-colors">
                <i className="fa-regular fa-comment text-lg"></i>
              </button>
              <button className="hover:text-green-400 transition-colors">
                <i className="fa-regular fa-paper-plane text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Hover Overlay - Click to Open */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/70 backdrop-blur-md cursor-pointer"
        >
          <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mb-3 mx-auto shadow-2xl">
              <i className="fa-solid fa-external-link-alt text-white text-2xl"></i>
            </div>
            <p className="text-white font-bold uppercase tracking-widest text-xs drop-shadow-lg">
              View on Instagram
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}
