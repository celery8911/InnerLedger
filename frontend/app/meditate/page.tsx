'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { RequireWallet } from '@/components/RequireWallet';

export default function MeditatePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isActive, setIsActive] = useState(true);
  const [breath, setBreath] = useState({
    phase: 'inhale' as 'inhale' | 'exhale',
    phaseTimeLeft: 4,
  });

  // Timer
  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft === 0) router.push('/awareness');
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft, router]);


  // Breathing Rhythm
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setBreath((prev) => {
        if (prev.phaseTimeLeft <= 1) {
          return {
            phase: prev.phase === 'inhale' ? 'exhale' : 'inhale',
            phaseTimeLeft: 4,
          };
        }
        return { ...prev, phaseTimeLeft: prev.phaseTimeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  if (!isConnected) {
    return <RequireWallet />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-[#121416]">
      <div className="absolute inset-0 organic-gradient opacity-50" />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <Header backHref="/" overlay showConnectButton={false} />

      <AnimatePresence>
        <motion.div
          className="z-10 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <>
            {/* Timer - Minimalist */}
            <div className="absolute top-10 text-white/50 font-light text-xl tracking-[0.4em] uppercase">
              {formatTime(timeLeft)}
            </div>

            {/* Breathing Circle */}
            <div className="relative mb-16 mt-8">
              <div
                className="w-64 h-64 rounded-full bg-gradient-to-br from-primary/20 to-white/5 backdrop-blur-3xl flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(82,122,119,0.2)] cursor-pointer hover:shadow-[0_0_70px_rgba(82,122,119,0.3)] transition-shadow duration-500"
                onClick={() => setIsActive(!isActive)}
              >
                <motion.div
                  className="w-full h-full rounded-full absolute inset-0 bg-primary/10 pointer-events-none"
                  animate={{
                    scale: breath.phase === 'inhale' ? 1.5 : 1,
                    opacity: breath.phase === 'inhale' ? 0.7 : 0.2,
                    boxShadow:
                      breath.phase === 'inhale'
                        ? '0 0 80px rgba(82,122,119,0.35)'
                        : '0 0 0 rgba(82,122,119,0)',
                  }}
                  transition={{ duration: 4, ease: 'easeInOut' }}
                />

                <div className="relative flex w-full max-w-[280px] aspect-square items-center justify-center z-10">
                  <div
                    className={`organic-shape w-64 h-64 flex items-center justify-center transition-transform duration-[4000ms] ease-in-out ${
                      breath.phase === 'inhale' ? 'scale-125' : 'scale-90'
                    }`}
                  >
                    <div className="text-center">
                      <motion.h1
                        key={breath.phase}
                        className="text-3xl font-light tracking-[0.25em] text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                          opacity: 1,
                          scale: breath.phase === 'inhale' ? 1.05 : 0.98,
                        }}
                        transition={{ duration: 1.6, ease: 'easeInOut' }}
                      >
                        {breath.phase === 'inhale' ? '吸' : '呼'}
                      </motion.h1>
                      <p className="text-white/40 text-sm mt-2">
                        {breath.phaseTimeLeft}s
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border border-primary/10 scale-125" />
                  <div className="absolute inset-0 rounded-full border border-primary/5 scale-150" />
                </div>
              </div>
              {/* Outer Glow Ring */}
              {isActive && (
                <div className="absolute inset-0 rounded-full border border-primary/20 scale-125 animate-[ping_4s_ease-in-out_infinite] opacity-30 pointer-events-none" />
              )}
            </div>

            <div className="text-center space-y-8">
              <p className="text-white/50 text-xs tracking-[0.4em] uppercase animate-pulse">
                {isActive ? '跟随每一次呼吸' : '已暂停'}
              </p>

              <button
                type="button"
                className="px-8 py-2.5 text-white/60 hover:text-white border border-white/10 hover:border-white/25 rounded-full transition-all text-xs tracking-[0.3em] uppercase bg-white/5 hover:bg-white/10"
                onClick={() => router.push('/awareness')}
              >
                结束练习
              </button>
            </div>
          </>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
