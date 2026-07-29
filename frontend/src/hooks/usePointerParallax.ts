import { useEffect, useRef } from 'react';

export interface PointerState {
  x: number;
  y: number;
  nx: number;
  ny: number;
  active: boolean;
}

/**
 * Returns stable ref objects instead of reactive state to avoid triggering
 * 60fps React re-renders on every mousemove/RAF tick.
 * Consumers read values directly from the refs in their own RAF loops.
 */
export function usePointerParallax() {
  // Refs hold the latest values — no React re-renders on update
  const pointerRef = useRef<PointerState>({ x: 0, y: 0, nx: 0.5, ny: 0.5, active: false });
  const parallaxRef = useRef({ x: 0, y: 0 });

  const target = useRef({ nx: 0.5, ny: 0.5, active: false });
  const smooth = useRef({ nx: 0.5, ny: 0.5 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = {
        nx: e.clientX / window.innerWidth,
        ny: e.clientY / window.innerHeight,
        active: true,
      };
    };

    const onLeave = () => {
      target.current.active = false;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    const tick = () => {
      smooth.current.nx += (target.current.nx - smooth.current.nx) * 0.08;
      smooth.current.ny += (target.current.ny - smooth.current.ny) * 0.08;

      const nx = smooth.current.nx;
      const ny = smooth.current.ny;

      // Write to refs — zero React overhead
      pointerRef.current = {
        x: nx * window.innerWidth,
        y: ny * window.innerHeight,
        nx,
        ny,
        active: target.current.active,
      };

      parallaxRef.current = {
        x: (nx - 0.5) * 2,
        y: (ny - 0.5) * 2,
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return { pointerRef, parallaxRef };
}
