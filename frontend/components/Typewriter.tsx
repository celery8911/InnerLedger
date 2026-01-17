'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function Typewriter({ text, speed = 50, onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      if (i < text.length) {
        i += 1;
        setDisplayedText(text.slice(0, i));
        timer = setTimeout(tick, speed);
        return;
      }

      onComplete?.();
    };

    if (text.length > 0) {
      timer = setTimeout(() => {
        setDisplayedText('');
        tick();
      }, 0);
    } else {
      timer = setTimeout(() => {
        setDisplayedText('');
        onComplete?.();
      }, 0);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [text, speed, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-white/80 leading-relaxed whitespace-pre-wrap font-light tracking-wide"
    >
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-2 h-4 bg-primary/80 ml-1 align-middle"
      />
    </motion.div>
  );
}
