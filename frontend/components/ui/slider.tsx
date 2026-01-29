'use client';

import { useRef } from 'react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'vertical' | 'horizontal';
  label?: string;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  thumbClassName?: string;
  disabled?: boolean;
};

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = 'vertical',
  label,
  icon: Icon,
  className,
  trackClassName,
  fillClassName,
  thumbClassName,
  disabled = false,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isVertical = orientation === 'vertical';
  const range = max - min;
  const clampedValue = Math.min(max, Math.max(min, value));
  const percent = range > 0 ? ((clampedValue - min) / range) * 100 : 0;

  const commitValue = (rawValue: number) => {
    if (disabled) return;
    const stepped =
      step > 0
        ? Math.round((rawValue - min) / step) * step + min
        : rawValue;
    const next = Math.min(max, Math.max(min, stepped));
    onChange(next);
  };

  const updateFromPointer = (clientX: number, clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = isVertical
      ? 1 - (Math.min(Math.max(clientY, rect.top), rect.bottom) - rect.top) / rect.height
      : (Math.min(Math.max(clientX, rect.left), rect.right) - rect.left) / rect.width;
    commitValue(min + ratio * range);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    updateFromPointer(event.clientX, event.clientY);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let next = clampedValue;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      next = clampedValue + step;
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      next = clampedValue - step;
    } else if (event.key === 'Home') {
      next = min;
    } else if (event.key === 'End') {
      next = max;
    } else {
      return;
    }

    event.preventDefault();
    commitValue(next);
  };

  return (
    <div className={cn('flex flex-col items-center gap-6 h-full', className)}>
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex items-center justify-center touch-none select-none',
          isVertical ? 'h-48 w-6 flex-col' : 'h-6 w-48',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          trackClassName,
        )}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        aria-orientation={orientation}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-full bg-white/10',
            isVertical ? 'h-full w-[2px]' : 'h-[2px] w-full',
          )}
        >
          <div
            className={cn(
              'absolute bg-primary rounded-full transition-all duration-300',
              isVertical ? 'bottom-0 left-0 w-full' : 'left-0 top-0 h-full',
              fillClassName,
            )}
            style={isVertical ? { height: `${percent}%` } : { width: `${percent}%` }}
          />
        </div>
        <div
          className={cn(
            'absolute size-4 bg-white rounded-full shadow-[0_0_18px_rgba(255,255,255,0.45)] transition-all duration-300 pointer-events-none',
            thumbClassName,
          )}
          style={
            isVertical
              ? { bottom: `${percent}%`, marginBottom: '-8px' }
              : { left: `${percent}%`, marginLeft: '-8px' }
          }
        />
      </div>
      {label || Icon ? (
        <div
          className={cn(
            'flex flex-col items-center gap-1 transition-all duration-500',
            clampedValue > min ? 'opacity-100 scale-110' : 'opacity-30 scale-100',
          )}
        >
          {Icon ? <Icon className="h-5 w-5 text-white/70" /> : null}
          {label ? (
            <span className="text-[9px] uppercase tracking-[0.35em] font-semibold text-white/70">
              {label}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
