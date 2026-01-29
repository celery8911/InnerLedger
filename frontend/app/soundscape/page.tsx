'use client';

import {
  CloudRain,
  Pause,
  Play,
  Timer,
  TreePine,
  Waves,
  Wind,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { Slider } from '@/components/ui/slider';

const SOUND_SOURCES = [
  {
    id: 'rain',
    name: 'Rain',
    icon: CloudRain,
    volume: 50,
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: TreePine,
    volume: 30,
  },
  {
    id: 'noise',
    name: 'Noise',
    icon: Waves,
    volume: 20,
  },
  {
    id: 'wind',
    name: 'Wind',
    icon: Wind,
    volume: 20,
  },
];

const TIMER_PRESETS = [10, 20, 30, 60];

export default function SoundscapePage() {
  const soundsConfig = SOUND_SOURCES;
  const [sounds, setSounds] = useState(() => soundsConfig);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const timerEndRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<
    Record<
      string,
      {
        gain: GainNode;
        source: AudioBufferSourceNode;
        stop: () => void;
      }
    >
  >({});
  const setupAudioGraph = useCallback((context: AudioContext) => {
    const createNoiseBuffer = () => {
      const length = context.sampleRate * 2;
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    };

    const createNoiseSource = (buffer: AudioBuffer) => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      return source;
    };

    const buffer = createNoiseBuffer();
    const nodes: typeof audioNodesRef.current = {};

    soundsConfig.forEach((sound) => {
      const gain = context.createGain();
      gain.gain.value = sound.volume / 100;

      const source = createNoiseSource(buffer);

      if (sound.id === 'noise') {
        source.connect(gain).connect(context.destination);
      }

      if (sound.id === 'rain') {
        const highpass = context.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 500;
        const lowpass = context.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 6000;
        source.connect(highpass).connect(lowpass).connect(gain).connect(context.destination);
      }

      if (sound.id === 'wind') {
        const lowpass = context.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 400;
        const modGain = context.createGain();
        modGain.gain.value = 1;
        const lfo = context.createOscillator();
        const lfoGain = context.createGain();
        lfo.frequency.value = 0.2;
        lfoGain.gain.value = 0.25;
        lfo.connect(lfoGain).connect(modGain.gain);
        lfo.start();
        source
          .connect(lowpass)
          .connect(modGain)
          .connect(gain)
          .connect(context.destination);
      }

      if (sound.id === 'forest') {
        const bandpass = context.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1200;
        bandpass.Q.value = 0.7;
        const modGain = context.createGain();
        modGain.gain.value = 1;
        const tremolo = context.createOscillator();
        const tremoloGain = context.createGain();
        tremolo.frequency.value = 0.6;
        tremoloGain.gain.value = 0.15;
        tremolo.connect(tremoloGain).connect(modGain.gain);
        tremolo.start();
        source
          .connect(bandpass)
          .connect(modGain)
          .connect(gain)
          .connect(context.destination);
      }

      nodes[sound.id] = {
        gain,
        source,
        stop: () => {
          try {
            source.stop();
          } catch {
            // Ignore repeated stops.
          }
        },
      };
    });

    audioNodesRef.current = nodes;
    Object.values(nodes).forEach((node) => {
      node.source.start();
    });
  }, [soundsConfig]);

  const updateVolume = (id: string, value: number) => {
    setSounds((prev) =>
      prev.map((sound) =>
        sound.id === id ? { ...sound, volume: value } : sound,
      ),
    );

    const node = audioNodesRef.current[id];
    if (node) {
      node.gain.gain.value = value / 100;
    }
  };

  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      setupAudioGraph(audioCtxRef.current);
    }
  }, [setupAudioGraph]);

  const startPlayback = useCallback(async () => {
    ensureAudio();
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
  }, [ensureAudio]);

  const pausePlayback = useCallback(async () => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'running') {
      await audioCtxRef.current.suspend();
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startPlayback();
    } else {
      pausePlayback();
    }
  }, [isPlaying, pausePlayback, startPlayback]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerEndRef.current = null;
    setTimerRemaining(null);
  }, []);

  const setTimerMinutes = useCallback((minutes: number) => {
    clearTimer();
    const endAt = Date.now() + minutes * 60 * 1000;
    timerEndRef.current = endAt;
    setTimerRemaining(minutes * 60);
    timerRef.current = window.setInterval(() => {
      if (!timerEndRef.current) return;
      const remaining = Math.max(
        0,
        Math.floor((timerEndRef.current - Date.now()) / 1000),
      );
      setTimerRemaining(remaining);
      if (remaining <= 0) {
        clearTimer();
        setIsPlaying(false);
      }
    }, 1000);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  useEffect(() => {
    return () => {
      Object.values(audioNodesRef.current).forEach((node) => {
        node.stop();
      });
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    };
  }, []);

  const timerLabel = timerRemaining
    ? `${Math.floor(timerRemaining / 60)}:${String(
        timerRemaining % 60,
      ).padStart(2, '0')}`
    : null;

  return (
    <div className="relative h-screen bg-[#121416] text-white overflow-hidden flex flex-col">
      <div className="absolute inset-0 organic-gradient opacity-70" />
      <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-120px] left-12 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <Header
        backHref="/"
        title="Soundscape"
        rightSlot={
          <div className="relative">
            <button
              type="button"
              className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:border-white/25 transition-colors"
              aria-label="Timer"
              onClick={() => setTimerOpen((prev) => !prev)}
            >
              <Timer className="h-4 w-4" />
            </button>
            {timerLabel ? (
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-white/70">
                {timerLabel}
              </span>
            ) : null}
          </div>
        }
      />

      <main className="relative z-10 flex flex-1 flex-col justify-center gap-6 px-6 pb-8 pt-4">
        <section className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(82,122,119,0.35),_transparent_55%)]" />
          <div
            className="relative h-[50vh] min-h-[240px] max-h-[420px] w-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://picsum.photos/800/1000?nature=1')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 text-center">
              <span className="text-[10px] uppercase tracking-[0.5em] text-white/60 mb-2">
                Currently Immersed in
              </span>
              <h3 className="text-2xl md:text-3xl font-light tracking-wide text-white">
                Pacific Northwest
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying((prev) => {
                    const next = !prev;
                    if (next) {
                      startPlayback();
                    } else {
                      pausePlayback();
                    }
                    return next;
                  });
                }}
                className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7" />
                ) : (
                  <Play className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="flex items-end justify-around gap-6 px-2 pb-4 pt-2 min-h-[200px]">
          {sounds.map((sound) => (
            <Slider
              key={sound.id}
              value={sound.volume}
              label={sound.name}
              icon={sound.icon}
              onChange={(value) => updateVolume(sound.id, value)}
            />
          ))}
        </section>
      </main>

      {timerOpen ? (
        <div className="absolute right-6 top-20 z-20 w-48 rounded-2xl border border-white/10 bg-[#14181b]/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <div className="text-[10px] uppercase tracking-[0.4em] text-white/60 mb-3">
            Timer
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TIMER_PRESETS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => {
                  setTimerMinutes(minutes);
                  setTimerOpen(false);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition-colors"
              >
                {minutes} min
              </button>
            ))}
          </div>
          {timerRemaining ? (
            <button
              type="button"
              onClick={() => {
                clearTimer();
                setTimerOpen(false);
              }}
              className="mt-3 w-full rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition-colors"
            >
              Cancel Timer
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
