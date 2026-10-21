import { useEffect, useState, type RefObject } from 'react';

export interface Size {
  width: number;
  height: number;
}

// Tracks an element's content size with a ResizeObserver.
export function useSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      // Round so sub-pixel jitter does not re-project the whole map.
      const next = { width: Math.round(rect.width), height: Math.round(rect.height) };
      setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}
