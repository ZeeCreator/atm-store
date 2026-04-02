'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InstagramPost from '@/components/InstagramPost';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Icons } from '@/components/Icon';
import { useLanguage } from '@/contexts/LanguageContext';

interface InstagramPostData {
  url: string;
  caption?: string;
  createdAt: number;
}

export default function InstagramGalleryPage() {
  const [posts, setPosts] = useState<InstagramPostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const instagramRef = ref(db, 'instagram');
    const unsubscribe = onValue(instagramRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load Instagram embed script globally
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-background">
        {/* Header */}
        <section className="py-16 md:py-24 px-4 md:px-8 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <i className="fa-brands fa-instagram text-4xl md:text-5xl text-gradient from-purple-500 to-pink-500"></i>
            </div>
            <h1 className="font-headline text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">
              {t.instagram.title}
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-6">
              {t.instagram.description}
            </p>
            <a
              href="https://www.instagram.com/atmautolight.aes_upswaymaker/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-4 md:px-8 py-2.5 md:py-4 text-xs md:text-base font-headline font-bold uppercase tracking-widest text-white rounded-md hover:scale-105 transition-transform w-full md:w-auto max-w-xs md:max-w-none mx-auto"
            >
              <i className="fa-brands fa-instagram text-base md:text-xl"></i>
              <span className="break-all">{t.instagram.followButton}</span>
            </a>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16 md:py-24 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Icons.Spinner className="text-5xl text-primary-container animate-spin" />
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {posts.map((post, index) => (
                  <div
                    key={index}
                    className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group"
                  >
                    <InstagramPost
                      url={post.url}
                      caption={post.caption}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <i className="fa-brands fa-instagram text-6xl text-white/30 mb-4"></i>
                <p className="text-white/60 font-headline uppercase tracking-widest mb-2">
                  {t.instagram.noPosts}
                </p>
                <p className="text-white/40 text-sm">
                  {t.instagram.followDescription}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
