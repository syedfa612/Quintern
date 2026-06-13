// Empty-state illustrations — pure-SVG, no external assets. Each illustration
// matches the visual weight and color tokens of the rest of the app. Use
// them in the `illustration` prop of <EmptyState>.

export function EmptyInbox({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" className={['w-32 h-24', className].join(' ')} aria-hidden="true">
      <defs>
        <linearGradient id="ei1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(99 102 241 / 0.18)" />
          <stop offset="100%" stopColor="rgb(139 92 246 / 0.04)" />
        </linearGradient>
      </defs>
      <rect x="20" y="30" width="120" height="72" rx="8" fill="url(#ei1)" stroke="rgb(var(--border))" strokeWidth="1" />
      <rect x="34" y="20" width="92" height="60" rx="6" fill="rgb(var(--surface-raised))" stroke="rgb(var(--border))" strokeWidth="1" />
      <path d="M34 28 H126 V40 L80 64 L34 40 Z" fill="rgb(99 102 241 / 0.18)" />
      <path d="M34 40 L80 64 L126 40" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.5" />
      <circle cx="118" cy="86" r="10" fill="rgb(16 185 129)" />
      <path d="M114 86 l3 3 l6 -6" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptyChart({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" className={['w-32 h-24', className].join(' ')} aria-hidden="true">
      <rect x="0" y="0" width="160" height="120" fill="none" />
      <line x1="20" y1="100" x2="140" y2="100" stroke="rgb(var(--border))" strokeWidth="1" />
      <line x1="20" y1="20" x2="20" y2="100" stroke="rgb(var(--border))" strokeWidth="1" />
      <rect x="32" y="60" width="14" height="40" rx="2" fill="rgb(var(--surface-sunken))" />
      <rect x="54" y="40" width="14" height="60" rx="2" fill="rgb(var(--surface-sunken))" />
      <rect x="76" y="70" width="14" height="30" rx="2" fill="rgb(var(--surface-sunken))" />
      <rect x="98" y="50" width="14" height="50" rx="2" fill="rgb(var(--surface-sunken))" />
      <rect x="120" y="80" width="14" height="20" rx="2" fill="rgb(var(--surface-sunken))" />
      <path d="M75 30 Q80 18 90 22" fill="none" stroke="rgb(99 102 241)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="89" cy="22" r="3" fill="rgb(99 102 241)" />
    </svg>
  );
}

export function EmptyTeam({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" className={['w-32 h-24', className].join(' ')} aria-hidden="true">
      <circle cx="50" cy="50" r="18" fill="rgb(99 102 241 / 0.15)" />
      <circle cx="80" cy="44" r="22" fill="rgb(139 92 246 / 0.15)" />
      <circle cx="110" cy="50" r="18" fill="rgb(236 72 153 / 0.15)" />
      <rect x="32" y="78" width="36" height="6" rx="3" fill="rgb(var(--surface-sunken))" />
      <rect x="62" y="78" width="36" height="6" rx="3" fill="rgb(var(--surface-sunken))" />
      <rect x="92" y="78" width="36" height="6" rx="3" fill="rgb(var(--surface-sunken))" />
      <rect x="40" y="92" width="80" height="4" rx="2" fill="rgb(var(--surface-sunken))" />
    </svg>
  );
}

export function EmptyTasks({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" className={['w-32 h-24', className].join(' ')} aria-hidden="true">
      <rect x="20" y="20" width="120" height="80" rx="8" fill="rgb(var(--surface-raised))" stroke="rgb(var(--border))" strokeWidth="1" />
      <line x1="20" y1="44" x2="140" y2="44" stroke="rgb(var(--border))" strokeDasharray="2 2" />
      <line x1="20" y1="64" x2="140" y2="64" stroke="rgb(var(--border))" strokeDasharray="2 2" />
      <line x1="20" y1="84" x2="140" y2="84" stroke="rgb(var(--border))" strokeDasharray="2 2" />
      <rect x="30" y="32" width="50" height="6" rx="3" fill="rgb(99 102 241 / 0.4)" />
      <rect x="30" y="52" width="70" height="6" rx="3" fill="rgb(var(--surface-sunken))" />
      <rect x="30" y="72" width="60" height="6" rx="3" fill="rgb(var(--surface-sunken))" />
      <rect x="30" y="92" width="80" height="6" rx="3" fill="rgb(var(--surface-sunken))" />
      <circle cx="130" cy="32" r="6" fill="rgb(16 185 129)" />
    </svg>
  );
}

export function EmptyCalendar({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" className={['w-32 h-24', className].join(' ')} aria-hidden="true">
      <rect x="22" y="24" width="116" height="80" rx="8" fill="rgb(var(--surface-raised))" stroke="rgb(var(--border))" strokeWidth="1" />
      <rect x="22" y="24" width="116" height="20" rx="8" fill="rgb(99 102 241 / 0.12)" />
      <line x1="38" y1="18" x2="38" y2="32" stroke="rgb(var(--fg-muted))" strokeWidth="2" strokeLinecap="round" />
      <line x1="122" y1="18" x2="122" y2="32" stroke="rgb(var(--fg-muted))" strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 4 }, (_, row) => Array.from({ length: 5 }, (_, col) => {
        const x = 32 + col * 22;
        const y = 54 + row * 14;
        return <rect key={`${row}-${col}`} x={x} y={y} width="16" height="10" rx="2" fill="rgb(var(--surface-sunken))" />;
      }))}
      <circle cx="98" cy="68" r="6" fill="rgb(99 102 241)" />
    </svg>
  );
}

export function EmptyProjects({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" className={['w-32 h-24', className].join(' ')} aria-hidden="true">
      <rect x="22" y="20" width="60" height="80" rx="6" fill="rgb(var(--surface-raised))" stroke="rgb(var(--border))" strokeWidth="1" />
      <rect x="86" y="20" width="52" height="38" rx="6" fill="rgb(var(--surface-raised))" stroke="rgb(var(--border))" strokeWidth="1" />
      <rect x="86" y="62" width="52" height="38" rx="6" fill="rgb(99 102 241 / 0.12)" stroke="rgb(99 102 241 / 0.4)" strokeWidth="1" />
      <line x1="32" y1="32" x2="68" y2="32" stroke="rgb(var(--fg-muted))" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="42" x2="56" y2="42" stroke="rgb(var(--fg-subtle))" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="52" x2="68" y2="52" stroke="rgb(var(--fg-subtle))" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="62" x2="48" y2="62" stroke="rgb(var(--fg-subtle))" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="72" x2="60" y2="72" stroke="rgb(var(--fg-subtle))" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="82" x2="52" y2="82" stroke="rgb(var(--fg-subtle))" strokeWidth="2" strokeLinecap="round" />
      <rect x="96" y="30" width="32" height="6" rx="3" fill="rgb(var(--surface-sunken))" />
      <rect x="96" y="42" width="24" height="4" rx="2" fill="rgb(var(--surface-sunken))" />
      <circle cx="124" cy="80" r="8" fill="rgb(99 102 241)" />
      <line x1="124" y1="76" x2="124" y2="84" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="120" y1="80" x2="128" y2="80" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyStars({ className = '' }) {
  // 5 stars arranged in a row, the first 2 filled to suggest "no rating data yet"
  return (
    <svg viewBox="0 0 160 120" className={['w-32 h-24', className].join(' ')} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => {
        // Star path: 5-pointed, scaled & positioned. Center at (16 + i*32, 36), radius 14
        const cx = 16 + i * 32, cy = 36, r = 14;
        const points = [];
        for (let k = 0; k < 10; k++) {
          const angle = -Math.PI / 2 + (k * Math.PI) / 5;
          const rad = k % 2 === 0 ? r : r * 0.45;
          points.push(`${(cx + Math.cos(angle) * rad).toFixed(2)},${(cy + Math.sin(angle) * rad).toFixed(2)}`);
        }
        return (
          <polygon
            key={i}
            points={points.join(' ')}
            fill={i < 2 ? 'rgb(245 158 11)' : 'rgb(var(--surface-sunken))'}
            stroke={i < 2 ? 'rgb(245 158 11)' : 'rgb(var(--border))'}
            strokeWidth="0.5"
          />
        );
      })}
      <rect x="40" y="80" width="80" height="6" rx="3" fill="rgb(var(--surface-sunken))" />
      <rect x="50" y="94" width="60" height="4" rx="2" fill="rgb(var(--surface-sunken))" />
    </svg>
  );
}

export function EmptySearch({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" className={['w-32 h-24', className].join(' ')} aria-hidden="true">
      <circle cx="64" cy="56" r="22" fill="none" stroke="rgb(var(--border-strong))" strokeWidth="3" />
      <line x1="80" y1="72" x2="100" y2="92" stroke="rgb(var(--border-strong))" strokeWidth="4" strokeLinecap="round" />
      <line x1="55" y1="56" x2="73" y2="56" stroke="rgb(99 102 241 / 0.4)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyBuildings({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" className={['w-32 h-24', className].join(' ')} aria-hidden="true">
      <rect x="22" y="30" width="32" height="76" rx="3" fill="rgb(var(--surface-raised))" stroke="rgb(var(--border))" strokeWidth="1" />
      <rect x="60" y="20" width="40" height="86" rx="3" fill="rgb(var(--surface-raised))" stroke="rgb(var(--border))" strokeWidth="1" />
      <rect x="106" y="40" width="32" height="66" rx="3" fill="rgb(var(--surface-raised))" stroke="rgb(var(--border))" strokeWidth="1" />
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 2 }, (_, c) => (
        <rect key={`a-${r}-${c}`} x={28 + c*10} y={38 + r*14} width="6" height="8" rx="1" fill="rgb(99 102 241 / 0.2)" />
      )))}
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 3 }, (_, c) => (
        <rect key={`b-${r}-${c}`} x={66 + c*10} y={28 + r*12} width="6" height="8" rx="1" fill="rgb(99 102 241 / 0.2)" />
      )))}
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 2 }, (_, c) => (
        <rect key={`c-${r}-${c}`} x={112 + c*10} y={48 + r*14} width="6" height="8" rx="1" fill="rgb(99 102 241 / 0.2)" />
      )))}
    </svg>
  );
}

export function EmptyLog({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" className={['w-32 h-24', className].join(' ')} aria-hidden="true">
      <rect x="34" y="20" width="92" height="84" rx="6" fill="rgb(var(--surface-raised))" stroke="rgb(var(--border))" strokeWidth="1" />
      <line x1="34" y1="36" x2="126" y2="36" stroke="rgb(var(--border))" strokeWidth="1" />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <circle cx="46" cy={48 + i * 12} r="2.5" fill={i === 0 ? 'rgb(16 185 129)' : i === 1 ? 'rgb(59 130 246)' : 'rgb(var(--border-strong))'} />
          <rect x="56" y={46 + i * 12} width={i % 2 ? 50 : 60} height="4" rx="2" fill="rgb(var(--surface-sunken))" />
        </g>
      ))}
    </svg>
  );
}

export function EmptyExport({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" className={['w-32 h-24', className].join(' ')} aria-hidden="true">
      <path d="M28 30 L100 30 L100 90 L28 90 Z" fill="rgb(var(--surface-raised))" stroke="rgb(var(--border))" strokeWidth="1" />
      <path d="M100 30 L120 50 L100 50 Z" fill="rgb(var(--surface-sunken))" stroke="rgb(var(--border))" strokeWidth="1" />
      <line x1="40" y1="46" x2="84" y2="46" stroke="rgb(var(--surface-sunken))" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="58" x2="92" y2="58" stroke="rgb(var(--surface-sunken))" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="70" x2="74" y2="70" stroke="rgb(var(--surface-sunken))" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="82" x2="84" y2="82" stroke="rgb(var(--surface-sunken))" strokeWidth="3" strokeLinecap="round" />
      <path d="M124 70 L132 70 M128 66 L128 78" stroke="rgb(99 102 241)" strokeWidth="2" strokeLinecap="round" />
      <path d="M118 80 L138 80" stroke="rgb(99 102 241)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
