'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Brain, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden text-foreground selection:bg-primary/30">
      <div className="absolute inset-0 organic-gradient opacity-90" />
      <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-120px] left-12 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <nav className="absolute top-0 w-full p-6 max-w-5xl z-50">
        <div className="flex items-center gap-3 text-base md:text-base font-semibold uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/80 to-white drop-shadow-[0_0_18px_rgba(82,122,119,0.6)]">
          <img
            src="/logo.png"
            alt=""
            className="h-7 w-7 rounded-full object-contain opacity-90"
            aria-hidden="true"
          />
          <span className="tracking-normal">InnerLedger</span>
          <span className="tracking-[0.45em]"> ·长了么</span>
        </div>
        <div className="mt-3 flex justify-end">
          <ConnectButton showBalance={false} accountStatus="avatar" />
        </div>
      </nav>

      <div className="z-10 flex flex-col items-center text-center space-y-10 max-w-3xl">
        <div className="flex items-center gap-4 glass-pill px-6 py-2 rounded-full text-sm md:text-xs text-white/60 tracking-[0.2em] uppercase">
          <span className="flex items-center gap-2">
            <Brain size={12} className="text-primary" />
            <span>AI 理解你</span>
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" />
            <span>区块链记住你</span>
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-primary/60">
          看见
          <span className="text-primary font-serif italic font-light mx-2">
            成长
          </span>
          的<br />
          真实形状
        </h1>

        <p className="text-base md:text-lg text-white/60 max-w-lg leading-relaxed font-light">
          一个陪伴理解你的AI伙伴。
          <br />
          一个帮你永久记录内在变化的链上账本。
        </p>

        <div className="flex flex-col sm:flex-row gap-6 pt-8">
          <Link
            href="/meditate"
            className="group relative px-10 py-4 rounded-full text-white/90 bg-primary/80 hover:bg-primary transition-all duration-500 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(82,122,119,0.35)]"
          >
            <span className="tracking-[0.2em] uppercase text-sm">开始旅程</span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            href="/journey"
            className="px-10 py-4 glass-pill text-white/70 rounded-full font-light hover:text-white hover:bg-white/10 transition-all tracking-[0.2em] uppercase text-sm"
          >
            成长履历
          </Link>

          <Link
            href="/soundscape"
            className="px-10 py-4 glass-pill text-white/70 rounded-full font-light hover:text-white hover:bg-white/10 transition-all tracking-[0.2em] uppercase text-sm"
          >
            沉浸音景
          </Link>
        </div>
      </div>
    </main>
  );
}
