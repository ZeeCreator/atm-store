'use client';

import { useEffect, useState, useRef } from 'react';

interface InstagramPostProps {
  url: string;
  caption?: string;
}

export default function InstagramPost({ url, caption }: InstagramPostProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract post ID from Instagram URL
  const getPostId = (url: string): string | null => {
    const patterns = [
      /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
      /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
      /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const postId = getPostId(url);

  useEffect(() => {
    if (!postId) {
      setError(true);
      setIsLoading(false);
      return;
    }

    // Load Instagram embed script
    const loadInstagramEmbed = () => {
      // Check if script already exists
      let script = document.querySelector('script[src="//www.instagram.com/embed.js"]') as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement('script');
        script.src = '//www.instagram.com/embed.js';
        script.async = true;
        script.onload = () => {
          // Re-render embeds after script loads
          if (typeof window !== 'undefined' && (window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
          }
          setIsLoading(false);
        };
        script.onerror = () => {
          setError(true);
          setIsLoading(false);
        };
        document.body.appendChild(script);
      } else {
        // Script already loaded, process embeds
        setTimeout(() => {
          if (typeof window !== 'undefined' && (window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
          }
          setIsLoading(false);
        }, 100);
      }
    };

    loadInstagramEmbed();

    // Cleanup
    return () => {
      // Don't remove script, just mark as not loading
    };
  }, [postId, url]);

  if (error || !postId) {
    return (
      <div className="bg-surface-container-low rounded-xl p-8 text-center border border-outline-variant/20">
        <i className="fa-brands fa-instagram text-4xl text-white/30 mb-4"></i>
        <p className="text-white/60 text-sm">Invalid Instagram URL</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {isLoading && (
        <div className="aspect-square bg-surface-container-highest flex items-center justify-center">
          <div className="text-center">
            <i className="fa-brands fa-instagram text-4xl text-primary animate-pulse mb-2"></i>
            <p className="text-white/40 text-xs uppercase tracking-widest">Loading...</p>
          </div>
        </div>
      )}
      
      <div className={`relative aspect-square ${isLoading ? 'hidden' : 'block'}`}>
        <blockquote 
          className="instagram-media" 
          data-instgrm-permalink={`https://www.instagram.com/p/${postId}/`}
          data-instgrm-version="14"
          style={{ 
            background: '#FFF',
            border: 0,
            borderRadius: '0px',
            boxShadow: 'none',
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <div style={{ padding: '16%' }}></div>
        </blockquote>
      </div>

      {caption && (
        <div className="p-4 bg-surface-container-low">
          <p className="text-gray-700 text-sm line-clamp-3">{caption}</p>
        </div>
      )}
    </div>
  );
}
