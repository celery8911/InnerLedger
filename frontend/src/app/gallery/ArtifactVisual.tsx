import type { MilestoneStyle } from './milestones';

type ArtifactVisualProps = {
  style: MilestoneStyle;
  variant?: 'detail' | 'card';
};

export function ArtifactVisual({
  style,
  variant = 'detail',
}: ArtifactVisualProps) {
  const sizes =
    variant === 'detail'
      ? {
          liquid: 'w-64 h-64',
          liquidGlow: 'w-48 h-48',
          chrome: 'w-48 h-48',
          orbital: 'w-56 h-56',
          orbitalGlow: 'w-32 h-32',
          crystal: 'w-56 h-56',
          crystalGlow: 'w-32 h-32',
          crystalSvg: 'w-40 h-40',
        }
      : {
          liquid: 'w-32 h-32',
          liquidGlow: 'w-24 h-24',
          chrome: 'w-24 h-24',
          orbital: 'w-28 h-28',
          orbitalGlow: 'w-20 h-20',
          crystal: 'w-28 h-28',
          crystalGlow: 'w-20 h-20',
          crystalSvg: 'w-20 h-20',
        };

  if (style === 'liquid') {
    return (
      <div
        className={`relative ${sizes.liquid} flex items-center justify-center`}
      >
        <div
          className={`absolute ${sizes.liquidGlow} bg-white/5 rounded-full blur-[50px]`}
        />
        <div className={`chrome-liquid ${sizes.chrome} animate-pulse`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full opacity-30" />
        </div>
      </div>
    );
  }

  if (style === 'orbital') {
    return (
      <div
        className={`relative ${sizes.orbital} flex items-center justify-center`}
      >
        <div
          className={`absolute ${sizes.orbitalGlow} bg-[#00E5FF]/10 blur-[80px] rounded-full`}
        />
        <svg
          className="w-full h-full transform scale-110 drop-shadow-[0_0_15px_rgba(0,255,230,0.5)]"
          viewBox="0 0 200 200"
        >
          <defs>
            <linearGradient id="ringGrad" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#00ffe6" stopOpacity="1" />
              <stop offset="100%" stopColor="#009e8e" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100, 125, 150].map((rot) => (
            <ellipse
              key={rot}
              className="opacity-80"
              cx="100"
              cy="100"
              fill="none"
              rx="70"
              ry="25"
              stroke="url(#ringGrad)"
              strokeWidth="1"
              transform={`rotate(${rot} 100 100)`}
            />
          ))}
          <circle cx="100" cy="100" fill="#fff" r="3" className="animate-pulse" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${sizes.crystal} flex items-center justify-center`}>
      <div
        className={`absolute ${sizes.crystalGlow} bg-[#00E5FF]/20 rounded-full blur-[60px]`}
      />
      <svg
        className={`${sizes.crystalSvg} drop-shadow-[0_0_30px_rgba(0,229,255,0.35)]`}
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="crystalGrad" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#BA68FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d="M50 5 L85 35 L85 65 L50 95 L15 65 L15 35 Z"
          fill="url(#crystalGrad)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.5"
        />
        <path
          d="M50 5 L50 95 M15 35 L85 35 M15 65 L85 65"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.3"
        />
        <path
          d="M50 5 L85 65 M50 5 L15 65 M85 35 L50 95 M15 35 L50 95"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.3"
        />
      </svg>
    </div>
  );
}
