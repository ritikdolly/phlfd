import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { CheckCircle, Clock, MapPin, Phone, ChevronRight } from 'lucide-react';
import { ORDER_STATUSES } from '../data/data';

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const [orderId] = useState(() => searchParams.get('orderId') || 'SAV-' + Math.floor(100000 + Math.random() * 900000));
  const [currentStep, setCurrentStep] = useState(2); // Preparing
  const timelineRef = useRef(null);
  const headerRef = useRef(null);
  const estimatedTime = 35;
  const [etaTime] = useState(() => new Date(Date.now() + 35 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { y: -20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', delay: 0.1 }
      );

      // Animate timeline steps
      gsap.fromTo('.track-step',
        { x: -20, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, stagger: 0.12, duration: 0.5, ease: 'power2.out', delay: 0.4 }
      );

      // Progress bar animation
      gsap.fromTo('.track-progress-fill',
        { scaleY: 0, transformOrigin: 'top' },
        { scaleY: 2.5 / ORDER_STATUSES.length, duration: 1.5, ease: 'power3.out', delay: 0.6 }
      );

      // Pulse on current step
      gsap.to('.current-step-dot', {
        scale: 1.3,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: 'sine.inOut',
      });
    });
    return () => ctx.revert();
  }, []);

  // Simulate order progression
  useEffect(() => {
    gsap.to('.track-progress-fill', {
      scaleY: (currentStep + 0.5) / ORDER_STATUSES.length,
      duration: 0.8,
      ease: 'power2.out',
      transformOrigin: 'top',
    });

    const timer = setTimeout(() => {
      if (currentStep < ORDER_STATUSES.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <div ref={headerRef} className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(201,147,58,0.2), rgba(232,185,106,0.1))', border: '2px solid rgba(201,147,58,0.4)' }}
          >
            <CheckCircle size={36} className="text-[#c9933a]" />
          </div>
          <h1
            className="font-display font-bold text-3xl text-[#f8f0e3] mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Order Confirmed! 🎉
          </h1>
          <p className="text-[#7a6b4e]">Your Savoria feast is on the way</p>
          <div className="mt-3 inline-flex items-center gap-2 glass-gold rounded-2xl px-5 py-2.5">
            <span className="text-xs text-[#7a6b4e]">Order ID</span>
            <span className="font-mono font-bold text-[#c9933a]">{orderId}</span>
          </div>
        </div>

        {/* ETA Card */}
        <div
          className="rounded-3xl p-6 mb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(201,147,58,0.1), rgba(212,112,60,0.05))', border: '1px solid rgba(201,147,58,0.2)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#7a6b4e] mb-1">Estimated Delivery</p>
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-[#c9933a]" />
                <span className="font-display font-bold text-3xl text-[#c9933a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {estimatedTime} min
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#7a6b4e]">Arriving by</p>
              <p className="font-semibold text-[#f8f0e3]">
                {etaTime}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 rounded-full" style={{ background: '#2e2a1e' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${((currentStep + 1) / ORDER_STATUSES.length) * 100}%`,
                background: 'linear-gradient(90deg, #c9933a, #e8b96a)',
              }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="card-dark p-6 mb-6">
          <h2
            className="font-display font-bold text-xl text-[#f8f0e3] mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Order Status
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: '#2e2a1e' }}>
              <div
                className="track-progress-fill absolute top-0 left-0 right-0 origin-top"
                style={{ height: '100%', background: 'linear-gradient(to bottom, #c9933a, #e8b96a)' }}
              />
            </div>

            <div className="space-y-6">
              {ORDER_STATUSES.map((status, i) => {
                const isDone = i < currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={status.id} className="track-step relative flex items-start gap-4 pl-12">
                    {/* Dot */}
                    <div
                      className={`absolute left-2.5 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-[#c9933a] border-[#c9933a]'
                          : isCurrent
                          ? 'border-[#c9933a] bg-[#1a1710] current-step-dot'
                          : 'border-[#2e2a1e] bg-[#1a1710]'
                      }`}
                    >
                      {isDone && <CheckCircle size={12} className="text-[#0a0804]" />}
                      {isCurrent && <div className="w-2.5 h-2.5 rounded-full bg-[#c9933a]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{status.icon}</span>
                          <span className={`font-medium text-sm ${isDone ? 'text-[#f8f0e3]' : isCurrent ? 'text-[#c9933a]' : 'text-[#4a4030]'}`}>
                            {status.label}
                          </span>
                          {isCurrent && (
                            <span className="badge badge-gold text-[0.6rem] animate-pulse">In Progress</span>
                          )}
                        </div>
                        {status.time !== '—' && (
                          <span className="text-xs text-[#7a6b4e]">{status.time}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card-dark p-4 flex items-center gap-3">
            <MapPin size={18} className="text-[#c9933a] flex-shrink-0" />
            <div>
              <p className="text-xs text-[#7a6b4e]">Delivering to</p>
              <p className="text-sm text-[#f8f0e3] font-medium">Your location</p>
            </div>
          </div>
          <div className="card-dark p-4 flex items-center gap-3">
            <Phone size={18} className="text-[#c9933a] flex-shrink-0" />
            <div>
              <p className="text-xs text-[#7a6b4e]">Support</p>
              <a href="tel:+919876543210" className="text-sm text-[#c9933a] font-medium hover:text-[#e8b96a]">
                Call us
              </a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/menu" className="btn-outline flex-1 text-center text-sm">
            Order More
          </Link>
          <Link to="/profile" className="btn-primary flex-1 text-center text-sm">
            View Order History <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
