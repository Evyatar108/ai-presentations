import { useRef, useState, useEffect, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
}

interface UseIntersectionObserverResult {
  ref: (node: HTMLElement | null) => void;
  isIntersecting: boolean;
  hasIntersected: boolean;
}

/**
 * Returns { ref, isIntersecting, hasIntersected }.
 * `hasIntersected` stays true once set (one-time entrance animations).
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverResult {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const nodeRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    nodeRef.current = node;
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasIntersected(true);
        }
      },
      { threshold, rootMargin }
    );
    observerRef.current.observe(node);
  }, [threshold, rootMargin]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { ref, isIntersecting, hasIntersected };
}
