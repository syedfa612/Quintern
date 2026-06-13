// =============================================================================
// CHARTS — pure-SVG, no chart library. All components accept the design
// tokens via Tailwind class names so they re-skin with the rest of the app.
// =============================================================================

import { useMemo } from 'react'

const PALETTES = {
  default:   ['#6366f1', '#22d3ee', '#f59e0b', '#ec4899', '#10b981', '#a855f7', '#f43f5e', '#0ea5e9'],
  brand:     ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#eef2ff'],
  status:    ['#10b981', '#f59e0b', '#ef4444'], // success / warning / danger
  sequential:['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5'],
  warm:      ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309'],
  cool:      ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
};

// =============================================================================
// DONUT — segmented ring with center label.
// =============================================================================
export function Donut({ data, size = 160, thickness = 18, centerLabel, centerSub, palette = 'default', className = '' }) {
  const colors = PALETTES[palette] || PALETTES.default;
  const total = useMemo(() => data.reduce((s, d) => s + (d.value || 0), 0), [data]);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map((d, i) => {
    const portion = total > 0 ? d.value / total : 0;
    const seg = { ...d, color: d.color || colors[i % colors.length], portion, dasharray: `${c * portion} ${c}`, offset };
    offset += c * portion;
    return seg;
  });
  return (
    <div className={['flex items-center gap-6', className].join(' ')}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgb(var(--border))" strokeWidth={thickness} />
          {segments.map((s, i) => (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
                    stroke={s.color} strokeWidth={thickness}
                    strokeDasharray={s.dasharray} strokeDashoffset={-s.offset}
                    className="transition-all duration-500 ease-spring" />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerLabel && <div className="text-2xl font-semibold text-fg tabular-nums">{centerLabel}</div>}
          {centerSub && <div className="text-xs text-fg-muted mt-0.5">{centerSub}</div>}
        </div>
      </div>
      {data.length > 0 && (
        <ul className="space-y-1.5 min-w-0">
          {data.map((d, i) => (
            <li key={d.label} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color || colors[i % colors.length] }} />
              <span className="text-fg truncate">{d.label}</span>
              <span className="text-fg-muted tabular-nums ml-auto">{d.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =============================================================================
// BAR CHART — vertical or horizontal.
// =============================================================================
export function BarChart({ data, height = 220, palette = 'default', horizontal = false, valueFormat, className = '' }) {
  const colors = PALETTES[palette] || PALETTES.default;
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);

  if (horizontal) {
    return (
      <div className={['space-y-2', className].join(' ')}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-fg truncate">{d.label}</span>
                <span className="text-fg-muted tabular-nums font-medium">{valueFormat ? valueFormat(d.value) : d.value}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-sunken overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500 ease-spring"
                     style={{ width: `${pct}%`, background: d.color || colors[i % colors.length] }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={['w-full', className].join(' ')} style={{ height }}>
      <div className="flex items-end gap-2 h-full pb-6 border-b border-border">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="text-[10px] text-fg-muted font-medium tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                {valueFormat ? valueFormat(d.value) : d.value}
              </div>
              <div className="w-full flex items-end" style={{ height: 'calc(100% - 1.5rem)' }}>
                <div className="w-full rounded-t transition-all duration-500 ease-spring hover:opacity-80"
                     style={{ height: `${pct}%`, background: d.color || colors[i % colors.length] }} />
              </div>
              <div className="text-[10px] text-fg-muted truncate max-w-full">{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// AREA / LINE CHART — single series.
// =============================================================================
export function AreaChart({ values = [], labels = [], height = 200, color = '#6366f1', gradient = true, className = '' }) {
  const width = 600;
  const h = height;
  const padX = 8;
  const padY = 12;
  const w = width - padX * 2;
  if (values.length === 0) return <div className={['text-sm text-fg-muted text-center py-8', className].join(' ')}>No data</div>;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? w / (values.length - 1) : w;
  const points = values.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (h - padY * 2) * (1 - (v - min) / range);
    return [x, y];
  });
  const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const areaPath = `${linePath} L ${padX + w} ${h - padY} L ${padX} ${h - padY} Z`;
  const gradId = `g-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox={`0 0 ${width} ${h}`} className={['w-full', className].join(' ')} preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gradient && <path d={areaPath} fill={`url(#${gradId})`} className="transition-all duration-500 ease-spring" />}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500 ease-spring" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill={color} className="opacity-0 hover:opacity-100 transition-opacity">
          <title>{labels[i] ? `${labels[i]}: ${values[i]}` : values[i]}</title>
        </circle>
      ))}
    </svg>
  );
}

// =============================================================================
// SPARKLINE — minimal, used in StatCards.
// =============================================================================
export function Sparkline({ values = [], width = 100, height = 28, color, className = '' }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const linePath = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  // Trend-based color: green if last > first, red if last < first, muted if equal
  const trendUp = values[values.length - 1] >= values[0];
  const stroke = color || (trendUp ? '#10b981' : '#ef4444');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      <defs>
        <linearGradient id="spk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#spk)" />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// =============================================================================
// HEATMAP — calendar-style grid (used for attendance).
// =============================================================================
export function Heatmap({ cells = [], rows = [], cols = [], valueKey = 'value', className = '', onCellClick }) {
  if (cells.length === 0) return null;
  return (
    <div className={['overflow-x-auto', className].join(' ')}>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${cols.length}, minmax(14px, 1fr))` }}>
        <div />
        {cols.map((c) => (
          <div key={c} className="text-[9px] text-fg-muted text-center font-medium uppercase tracking-wider">{c}</div>
        ))}
        {rows.map((r, ri) => (
          <>
            <div key={`r-${ri}`} className="text-[10px] text-fg-muted text-right pr-2 self-center">{r}</div>
            {cols.map((c, ci) => {
              const cell = cells.find((x) => x.row === r && x.col === c) || { value: 0 };
              return (
                <button key={`c-${ri}-${ci}`}
                        onClick={() => onCellClick?.(cell)}
                        title={`${r} ${c}: ${cell[valueKey] ?? 0}`}
                        className="h-6 rounded-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        style={{ background: heatColor(cell[valueKey] ?? 0) }} />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

function heatColor(v) {
  if (!v) return 'rgb(244 244 245)';
  if (v >= 80) return '#10b981';
  if (v >= 60) return '#34d399';
  if (v >= 40) return '#fbbf24';
  if (v >= 20) return '#f97316';
  return '#ef4444';
}

// =============================================================================
// RADIAL PROGRESS — circular gauge (used for things like profile completeness).
// =============================================================================
export function RadialProgress({ value, max = 100, size = 120, thickness = 10, label, sublabel, color = '#6366f1' }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgb(var(--border))" strokeWidth={thickness} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={thickness}
                  strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
                  className="transition-all duration-700 ease-spring" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label && <div className="text-2xl font-semibold text-fg tabular-nums">{label}</div>}
          {sublabel && <div className="text-[10px] text-fg-muted uppercase tracking-wider mt-0.5">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// GAUGE — single-axis gauge with colored zones.
// =============================================================================
export function Gauge({ value, max = 100, label, size = 200, className = '' }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = size / 2 - 20;
  const c = Math.PI * r;
  const dash = c * pct;
  const cx = size / 2;
  const cy = size / 2;
  // Color: red < 40, yellow 40-75, green > 75
  const color = pct < 0.4 ? '#ef4444' : pct < 0.75 ? '#f59e0b' : '#10b981';
  return (
    <div className={['flex flex-col items-center', className].join(' ')}>
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <path d={`M 20 ${cy} A ${r} ${r} 0 0 1 ${size - 20} ${cy}`} fill="none" stroke="rgb(var(--border))" strokeWidth="14" strokeLinecap="round" />
        <path d={`M 20 ${cy} A ${r} ${r} 0 0 1 ${size - 20} ${cy}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`} className="transition-all duration-700 ease-spring" />
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-fg font-semibold" style={{ fontSize: 22 }}>{Math.round(pct * 100)}%</text>
        {label && <text x={cx} y={cy + 14} textAnchor="middle" className="fill-fg-muted" style={{ fontSize: 11 }}>{label}</text>}
      </svg>
    </div>
  );
}

// =============================================================================
// TREND LINE — used for attendance trends with month labels.
// =============================================================================
export function TrendChart({ data = [], valueKey = 'count', labelKey = 'month', color = '#6366f1', height = 220, className = '' }) {
  if (data.length === 0) return null;
  // Group by label, then build a series per status (PRESENT/ABSENT/HALF_DAY)
  const months = [...new Set(data.map((d) => d[labelKey]))].sort();
  const statuses = ['PRESENT', 'ABSENT', 'HALF_DAY'];
  const statusColor = { PRESENT: '#10b981', ABSENT: '#ef4444', HALF_DAY: '#f59e0b' };
  const series = statuses.map((s) => ({
    label: s,
    color: statusColor[s],
    values: months.map((m) => {
      const row = data.find((d) => d[labelKey] === m && d.status === s);
      return Number(row?.[valueKey] || 0);
    }),
  }));
  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(...allValues, 1);

  const width = 600;
  const padX = 12;
  const padY = 12;
  const w = width - padX * 2;
  const h = height - padY * 2 - 30;
  const stepX = months.length > 1 ? w / (months.length - 1) : w;

  return (
    <div className={['w-full', className].join(' ')}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line key={i} x1={padX} y1={padY + h * (1 - p)} x2={padX + w} y2={padY + h * (1 - p)}
                stroke="rgb(var(--border-muted))" strokeDasharray="2 4" />
        ))}
        {series.map((s, si) => {
          const points = s.values.map((v, i) => {
            const x = padX + i * stepX;
            const y = padY + h * (1 - v / max);
            return [x, y];
          });
          const path = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
          return (
            <g key={si}>
              <path d={path} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="transition-all duration-500 ease-spring"
                    style={{ transitionDelay: `${si * 100}ms` }} />
              {points.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="3" fill={s.color} className="opacity-80" />
              ))}
            </g>
          );
        })}
        {/* X-axis labels */}
        {months.map((m, i) => (
          <text key={i} x={padX + i * stepX} y={height - 6} textAnchor="middle"
                className="fill-fg-muted" style={{ fontSize: 10 }}>{m}</text>
        ))}
      </svg>
      <div className="flex items-center justify-center gap-4 mt-2">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-fg-muted">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
