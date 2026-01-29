'use client';

import type { ComponentType } from 'react';
import { useRef } from 'react';

type SoundscapeSliderProps = {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
  volume: number;
  onChange: (value: number) => void;
};

export function SoundscapeSlider({
  name,
  icon: Icon,
  volume,
  onChange,
}: SoundscapeSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const updateFromClientY = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clamped = Math.min(Math.max(clientY, rect.top), rect.bottom);
    const ratio = 1 - (clamped - rect.top) / rect.height;
    onChange(Math.round(ratio * 100));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromClientY(event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    updateFromClientY(event.clientY);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let next = volume;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      next = Math.min(100, volume + 5);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      next = Math.max(0, volume - 5);
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = 100;
    } else {
      return;
    }

    event.preventDefault();
    onChange(next);
  };

  return (
    <div className="flex flex-col items-center gap-6 h-full">
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
        className="relative flex flex-col items-center h-48 w-6 touch-none select-none cursor-pointer"
        role="slider"
        tabIndex={0}
        aria-label={`${name} volume`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={volume}
      >
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(event) => onChange(Number(event.target.value))}
          className="absolute inset-0 opacity-0 pointer-events-none"
          aria-label={`${name} volume`}
        />
        <div className="w-[2px] h-full bg-white/10 rounded-full relative overflow-hidden">
          <div
            className="absolute bottom-0 left-0 w-full bg-primary rounded-full transition-all duration-300"
            style={{ height: `${volume}%` }}
          />
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 size-4 bg-white rounded-full shadow-[0_0_18px_rgba(255,255,255,0.45)] transition-all duration-300 pointer-events-none"
          style={{ bottom: `${volume}%`, marginBottom: '-8px' }}
        />
      </div>
      <div
        className={`flex flex-col items-center gap-1 transition-all duration-500 ${
          volume > 0 ? 'opacity-100 scale-110' : 'opacity-30 scale-100'
        }`}
      >
        <Icon className="h-5 w-5 text-white/70" />
        <span className="text-[9px] uppercase tracking-[0.35em] font-semibold text-white/70">
          {name}
        </span>
      </div>
    </div>
  );
}
