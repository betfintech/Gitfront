interface SignalBadgeProps {
  direction: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SignalBadge({ direction, size = 'md' }: SignalBadgeProps) {
  const config: Record<string, { label: string; color: string; bg: string; border: string }> = {
    STRONG_BUY: { label: '⬆ STRONG BUY', color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50' },
    BUY: { label: '↑ BUY', color: 'text-green-300', bg: 'bg-green-500/20', border: 'border-green-500/50' },
    WEAK_BUY: { label: '↑ WEAK BUY', color: 'text-green-400/70', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    NEUTRAL: { label: '→ NEUTRAL', color: 'text-gray-300', bg: 'bg-gray-500/20', border: 'border-gray-500/50' },
    WEAK_SELL: { label: '↓ WEAK SELL', color: 'text-orange-400/70', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    SELL: { label: '↓ SELL', color: 'text-red-300', bg: 'bg-red-500/20', border: 'border-red-500/50' },
    STRONG_SELL: { label: '⬇ STRONG SELL', color: 'text-rose-300', bg: 'bg-rose-500/20', border: 'border-rose-500/50' },
  };

  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-1.5' };
  const c = config[direction] || config.NEUTRAL;

  return (
    <span className={`inline-flex items-center font-bold rounded-lg border ${c.color} ${c.bg} ${c.border} ${sizes[size]}`}>
      {c.label}
    </span>
  );
}

interface GradeBadgeProps {
  grade: string;
  confidence?: number;
}

export function GradeBadge({ grade, confidence }: GradeBadgeProps) {
  const colors: Record<string, string> = {
    A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    B: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    C: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    D: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold ${colors[grade] || colors.D}`}>
      <span className="text-sm">Grade {grade}</span>
      {confidence !== undefined && (
        <span className="text-xs opacity-75">{confidence.toFixed(0)}%</span>
      )}
    </div>
  );
}
