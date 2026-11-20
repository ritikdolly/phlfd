import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Flame } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { onComplete(); return; }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 0.8,
            ease: 'power3.inOut',
            onComplete,
          });
        },
      });

      // Set initial states
      gsap.set([logoRef.current, textRef.current], { autoAlpha: 0, y: 30 });
      gsap.set(barRef.current, { scaleX: 0, transformOrigin: 'left' });

      tl.to(logoRef.current, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' })
        .to(textRef.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
        .to(barRef.current, { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, '+=0.1')
        .to([logoRef.current, textRef.current], { autoAlpha: 0, y: -20, duration: 0.4, ease: 'power2.in' }, '+=0.3');
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="loading-screen">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-[#c9933a] rounded-full"
            style={{
              width: `${(i + 1) * 100}px`,
              height: `${(i + 1) * 100}px`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo */}
        <div ref={logoRef}>
          <div className="w-20 h-20 rounded-3xl bg-[#d4af37]/15 border-2 border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-[0_0_50px_rgba(201,147,58,0.4)] mb-2">
            <Flame className="w-10 h-10 fill-[#d4af37]/30" />
          </div>
        </div>

        {/* Brand name */}
        <div ref={textRef} className="text-center">
          <h1
            className="font-display text-5xl font-bold text-gold-gradient mb-1"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            SAVORIA
          </h1>
          <p className="text-[#7a6b4e] text-xs tracking-[0.3em] uppercase">
            The Art of Indian Cuisine
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-[1px] bg-[#2e2a1e] mt-4 overflow-hidden">
          <div
            ref={barRef}
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #c9933a, #e8b96a)' }}
          />
        </div>
      </div>
    </div>
  );
}
