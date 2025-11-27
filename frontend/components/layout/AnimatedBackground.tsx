'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const hasRendered = useRef(false);

  useEffect(() => {
    // Ne charger l'animation qu'une fois et seulement si les performances le permettent
    if (hasRendered.current) return;
    hasRendered.current = true;

    // Vérifier si l'utilisateur préfère les animations réduites
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Lazy load de l'animation seulement si nécessaire
    const loadAnimation = () => {
      // Animation très légère si nécessaire
    };

    // Charger après que le contenu principal soit chargé
    if (document.readyState === 'complete') {
      loadAnimation();
    } else {
      window.addEventListener('load', loadAnimation, { once: true });
    }
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#0a1929] via-[#1a3a52] to-[#2a5a7a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(10,25,41,0.8)_100%)]" />
      
      <svg 
        className="absolute inset-0 w-full h-full" 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="25" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="40" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <linearGradient id="smoke1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: '#a8d8ea', stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: '#3782a5', stopOpacity: 0.1 }} />
          </linearGradient>
          
          <linearGradient id="smoke2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#e0f7ff', stopOpacity: 0.8 }} />
            <stop offset="50%" style={{ stopColor: '#7ec8e3', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#00c3d8', stopOpacity: 0.05 }} />
          </linearGradient>
          
          <linearGradient id="smoke3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#cceeff', stopOpacity: 0.7 }} />
            <stop offset="50%" style={{ stopColor: '#5da9c9', stopOpacity: 0.35 }} />
            <stop offset="100%" style={{ stopColor: '#2a6b8a', stopOpacity: 0.08 }} />
          </linearGradient>

          <linearGradient id="smoke4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#b3e5fc', stopOpacity: 0.85 }} />
            <stop offset="50%" style={{ stopColor: '#4fc3f7', stopOpacity: 0.45 }} />
            <stop offset="100%" style={{ stopColor: '#0288d1', stopOpacity: 0.1 }} />
          </linearGradient>
          
          <radialGradient id="smokeRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: '#b3e5fc', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#4a95b8', stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/*{shapesRef.current.map((shape) => (
          <path
            key={shape.id}
            className="morphing-shape"
            d={shape.path}
            fill={`url(#${shape.gradient})`}
            filter={`url(#${shape.filter})`}
            opacity={shape.opacity}
          />
        ))}*/}

        <Orb cx={400} cy={250} rx={180} ry={200} opacity={0.35} seed={1} />
        <Orb cx={1400} cy={700} rx={200} ry={180} opacity={0.3} seed={2} />
        <Orb cx={900} cy={450} rx={120} ry={140} opacity={0.25} seed={3} />
        <Orb cx={1200} cy={950} rx={220} ry={350} opacity={0.55} seed={4} />
      </svg>
    </div>
  );
}

function Orb({ cx, cy, rx, ry, opacity, seed }: { cx: number; cy: number; rx: number; ry: number; opacity: number; seed: number }) {
  const duration = 35 + seed * 3;
  const delay = seed * -5;

  return (
    <>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="url(#smokeRadial)"
        filter="url(#strongGlow)"
        opacity={opacity}
        className={`orb-${seed}`}
      />
      <style jsx>{`
        @keyframes float${seed} {
          0%, 100% {
            transform: translate(0px, 0px) scale(1, 1);
          }
          25% {
            transform: translate(${30 + seed * 20}px, ${-20 - seed * 10}px) scale(${1.2 - seed * 0.1}, ${0.9 + seed * 0.05});
          }
          50% {
            transform: translate(${-25 - seed * 15}px, ${25 + seed * 15}px) scale(${0.85 + seed * 0.05}, ${1.3 - seed * 0.1});
          }
          75% {
            transform: translate(${20 - seed * 10}px, ${-30 + seed * 10}px) scale(${1.1 + seed * 0.05}, ${0.95 - seed * 0.05});
          }
        }
        
        .orb-${seed} {
          animation: float${seed} ${duration}s ease-in-out ${delay}s infinite;
        }
      `}</style>
    </>
  );
}

function generateSmoothPath(progress: number = 0, seed: number = 0): string {
  const time = progress * Math.PI * 2;
  const offset = seed * 100;
  
  const numPoints = 6 + (seed % 3);
  const points: { x: number; y: number }[] = [];
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2 + time * 0.3;
    const radiusVariation = Math.sin(time * 2 + i) * 100 + Math.cos(time * 1.5 + seed) * 80;
    const baseRadius = 300 + seed * 50;
    const radius = baseRadius + radiusVariation;
    
    const centerX = 960 + Math.sin(time * 0.5 + offset) * 300;
    const centerY = 540 + Math.cos(time * 0.4 + offset) * 200;
    
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    
    const cpX = (current.x + next.x) / 2;
    const cpY = (current.y + next.y) / 2;
    
    const tension = 0.3;
    const cp1x = cpX + (next.x - current.x) * tension;
    const cp1y = cpY + (next.y - current.y) * tension;
    
    path += ` Q ${cp1x} ${cp1y} ${next.x} ${next.y}`;
  }
  
  path += ' Z';
  
  return path;
}
