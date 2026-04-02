// Instagram Posts Config - DEPRECATED
// Instagram posts are now managed via Admin Panel
// Go to /admin and click "Instagram" tab to manage posts

// Default posts (used as fallback if Firebase is empty)
export const INSTAGRAM_POST_URLS: string[] = [
  'https://www.instagram.com/p/DWeISm9k0mL/',
  'https://www.instagram.com/p/DWGozdTE7vD/',
  'https://www.instagram.com/p/DWGoeo5k6ex/',
];

// This function is no longer used
export function addInstagramPost(url: string) {
  console.warn('addInstagramPost is deprecated. Use Admin Panel instead.');
}
