import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        },
      });
      gsap.set(barRef.current, { scaleX: 0, transformOrigin: 'left' });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={barRef}
      className="scroll-progress"
      style={{ width: '100%' }}
    />
  );
}
