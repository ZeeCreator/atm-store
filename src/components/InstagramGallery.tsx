'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import InstagramPost from './InstagramPost';

export default function InstagramGallery() {
  const [instagramPosts, setInstagramPosts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch instagram posts from Firebase
    const instagramRef = ref(db, 'instagram');
    const unsubscribe = onValue(instagramRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsList: string[] = Object.values(data) as string[];
        setInstagramPosts(postsList);
      } else {
        // Default posts if no data in Firebase
        setInstagramPosts([
          'https://www.instagram.com/p/DWeISm9k0mL/',
          'https://www.instagram.com/p/DWGozdTE7vD/',
          'https://www.instagram.com/p/DWGoeo5k6ex/',
        ]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="max-w-6xl mx-auto text-center">
          <i className="fa-brands fa-instagram text-6xl text-white/20 animate-pulse mb-4"></i>
          <p className="text-white/40 font-headline uppercase tracking-widest text-sm">
            Loading Instagram posts...
          </p>
        </div>
      </section>
    );
  }

  if (instagramPosts.length === 0) {
    return (
      <section className="py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-surface-container-low p-12 rounded-lg border-2 border-dashed border-white/20">
            <i className="fa-brands fa-instagram text-6xl text-white/20 mb-4"></i>
            <p className="text-white/40 font-headline uppercase tracking-widest">
              Instagram Posts Coming Soon
            </p>
            <p className="text-white/60 text-sm mt-2">
              Belum ada postingan. Jadilah yang pertama!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {instagramPosts.map((url, index) => (
            <div key={index} className="flex justify-center">
              <InstagramPost url={url} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
