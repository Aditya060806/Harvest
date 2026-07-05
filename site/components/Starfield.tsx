'use client';

import { useEffect, useRef } from 'react';

/** Lightweight animated starfield on a canvas — the cinematic hero backdrop. */
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let stars: { x: number; y: number; z: number; r: number }[] = [];
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(160, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        z: Math.random(),
        r: Math.random() * 1.4 + 0.2,
      }));
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (!prefersReduced) {
          s.y += (0.05 + s.z * 0.15);
          if (s.y > h) s.y = 0;
        }
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin((Date.now() / 1400) + s.x));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${230 + s.z * 25}, ${180 + s.z * 40}, ${120 + s.z * 60}, ${0.25 + s.z * 0.5 * twinkle})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
