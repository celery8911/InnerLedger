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
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-[40px]" />
        <svg viewBox="0 0 200 200" className="w-full h-full artifact-glow opacity-80">
          <defs>
            <linearGradient id="ringGrad" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: '#00E5FF', stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: '#00E5FF', stopOpacity: 0.1 }}
              />
            </linearGradient>
          </defs>
          {[0, 30, 60, 90, 120, 150].map((rot) => (
            <ellipse
              key={rot}
              transform={`rotate(${rot} 100 100)`}
              cx="100"
              cy="100"
              rx="70"
              ry="25"
              stroke="url(#ringGrad)"
              strokeWidth="1"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: `${rot * 10}ms` }}
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
