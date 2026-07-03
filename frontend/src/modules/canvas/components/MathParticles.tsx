import { useEffect, useRef } from 'react';

const SYMBOLS = [
  '∫', '∂', '∑', '∏', '∇', '∆', '∞', 'dx', 'dy',
  'E=mc²', 'F=ma', 'λ=h/p', 'E=hf', 'ω=2πf',
  'α', 'β', 'γ', 'δ', 'π', 'σ', 'φ', 'Ω',
  '∈', '∅', '∀', '∃', 'e^(iπ)+1=0', 'sin²θ+cos²θ=1',
  'ℝ', 'ℂ', 'μ=E[X]', 'P(A|B)',
];

const COLORS = [
  'rgba(0,240,255,',
  'rgba(157,0,255,',
  'rgba(255,0,127,',
  'rgba(57,255,20,',
  'rgba(255,170,0,',
];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  symbol: string;
  color: string;
  size: number;
  opacity: number;
  opacityDir: number;
  rotation: number;
  rotSpeed: number;
}

// Fewer particles = less canvas work per frame
const PARTICLE_COUNT = 25;

function createParticle(w: number, h: number): Particle {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.3 - 0.1,
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    color,
    size: 11 + Math.random() * 14,
    opacity: Math.random() * 0.35 + 0.05,
    opacityDir: Math.random() > 0.5 ? 1 : -1,
    rotation: (Math.random() - 0.5) * 0.6,
    rotSpeed: (Math.random() - 0.5) * 0.006,
  };
}

export default function MathParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(W, H)
    );

    let rafId = 0;
    let lastTime = 0;
    const TARGET_INTERVAL = 1000 / 24; // 24fps — background decoration, doesn't need 60fps

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);
      if (now - lastTime < TARGET_INTERVAL) return;
      lastTime = now;

      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.opacity += 0.003 * p.opacityDir;
        if (p.opacity >= 0.45) { p.opacity = 0.45; p.opacityDir = -1; }
        if (p.opacity <= 0.04) { p.opacity = 0.04; p.opacityDir =  1; }

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.x < -80)    p.x = W + 40;
        if (p.x > W + 80) p.x = -40;
        if (p.y < -60)    p.y = H + 40;
        if (p.y > H + 60) p.y = -40;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Single-pass draw — no ctx.filter (extremely expensive)
        ctx.globalAlpha = p.opacity;
        ctx.font = `bold ${p.size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `${p.color}1)`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = `${p.color}0.5)`;
        ctx.shadowBlur = 6;
        ctx.fillText(p.symbol, 0, 0);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        ctx.restore();
      }
    };

    rafId = requestAnimationFrame(draw);

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
      for (const p of particles) {
        if (p.x > W) p.x = Math.random() * W;
        if (p.y > H) p.y = Math.random() * H;
      }
    };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
