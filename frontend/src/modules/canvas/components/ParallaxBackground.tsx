import { useEffect, useRef, MutableRefObject } from 'react';

interface ParallaxBackgroundProps {
  parallaxRef: MutableRefObject<{ x: number; y: number }>;
}

export default function ParallaxBackground({ parallaxRef }: ParallaxBackgroundProps) {
  const blob1Ref  = useRef<HTMLDivElement>(null);
  const blob2Ref  = useRef<HTMLDivElement>(null);
  const blob3Ref  = useRef<HTMLDivElement>(null);
  const gridRef   = useRef<HTMLDivElement>(null);
  const dotsRef   = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const { x, y } = parallaxRef.current;

      // Direct DOM style writes — zero React re-renders
      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${x * -40}px, ${y * -30}px)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${x * 50}px, ${y * 40}px)`;
      }
      if (blob3Ref.current) {
        blob3Ref.current.style.transform = `translate(calc(-50% + ${x * 25}px), calc(-50% + ${y * 25}px))`;
      }
      if (gridRef.current) {
        const gx = x * 24;
        const gy = y * 24;
        gridRef.current.style.backgroundPosition = `${gx}px ${gy}px`;
      }
      if (dotsRef.current) {
        dotsRef.current.style.backgroundPosition = `${x * -16}px ${y * -16}px`;
        dotsRef.current.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [parallaxRef]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div
        ref={blob1Ref}
        className="absolute top-[-10%] left-[-5%] w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[80px] will-change-transform"
      />
      <div
        ref={blob2Ref}
        className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[80px] will-change-transform"
      />
      <div
        ref={blob3Ref}
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] will-change-transform"
      />

      <div
        ref={gridRef}
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div
        ref={dotsRef}
        className="absolute inset-0 opacity-[0.03] will-change-transform"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #00f0ff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
}
