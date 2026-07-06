import { useState, useEffect } from 'react';

const CACHE_NAME = 'atelier-video-cache-v1';

export function useCachedVideo(url, shouldLoad = false) {
  const [cachedUrl, setCachedUrl] = useState(null);

  useEffect(() => {
    if (!url) return;

    let isMounted = true;

    const checkCacheAndLoad = async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(url);

        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          if (isMounted) setCachedUrl(URL.createObjectURL(blob));
        } else if (shouldLoad) {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response.clone());
            const blob = await response.blob();
            if (isMounted) setCachedUrl(URL.createObjectURL(blob));
          }
        }
      } catch (error) {
        // Silently fail if CORS or network blocks the fetch. 
        // It will gracefully fall back to streaming the video URL directly.
        // console.warn('Video caching disabled (CORS/Network):', url);
      }
    };

    checkCacheAndLoad();

    return () => {
      isMounted = false;
    };
  }, [url, shouldLoad]);

  return cachedUrl || url;
}
