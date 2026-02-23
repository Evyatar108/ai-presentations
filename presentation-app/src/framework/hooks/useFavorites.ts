import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MAX_RECENT = 10;

export function useFavorites() {
  const [favoritesArray, setFavoritesArray] = useLocalStorage<string[]>('welcome:favorites', []);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage<string[]>('welcome:recentlyViewed', []);

  const favorites = useMemo(() => new Set(favoritesArray), [favoritesArray]);

  const toggleFavorite = useCallback((id: string) => {
    setFavoritesArray(prev => {
      if (prev.includes(id)) {
        return prev.filter(f => f !== id);
      }
      return [...prev, id];
    });
  }, [setFavoritesArray]);

  const recordView = useCallback((id: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(v => v !== id);
      return [id, ...filtered].slice(0, MAX_RECENT);
    });
  }, [setRecentlyViewed]);

  return {
    favorites,
    recentlyViewed,
    toggleFavorite,
    recordView,
  };
}
