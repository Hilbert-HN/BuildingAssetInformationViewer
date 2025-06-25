import { useState, useEffect, useRef, RefObject } from 'react';

interface InViewOptions {
  threshold?: number;
  rootMargin?: string;
}

type InViewHookReturn = [React.RefObject<any>, boolean];

export function useInView({ threshold = 0, rootMargin = '0px' }: InViewOptions = {}): InViewHookReturn {
  const [isIntersecting, setIntersecting] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, threshold, rootMargin]);

  return [ref, isIntersecting];
}