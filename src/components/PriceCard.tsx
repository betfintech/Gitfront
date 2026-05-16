import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MarketData } from '../store/tradingStore';

interface PriceCardProps {
  data: MarketData;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

function formatPrice(price: number, _symbol?: string): string {
  if (!price) return '0.00';
  if (price < 0.0001) return price.toFixed(8);
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  if (price < 100) return price.toFixed(4);
  if (price < 10000) return price.toFixed(2);
  return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
}


function getSourceBadge(source: string) {
  const badges: Record<string, string> = {
    binance: 'bg-yellow-500/20 text-yellow-400',
    deriv: 'bg-purple-500/20 text-purple-400',
    synthetic: 'bg-blue-500/20 text-blue-400',
  };
  return badges[source] || 'bg-gray-500/20 text-gray-400';
}

export function PriceCard({ data, onClick, selected, compact }: PriceCardProps) {
  const change = data.change24h ?? data.lastChange ?? 0;
  const isPositive = change > 0;
  const isNegative = change < 0;
  const displayName = data.displayName || data.symbol;
  const isRecent = data.updatedAt && Date.now() - data.updatedAt < 3000;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all
          ${selected ? 'bg-blue-600/20 border border-blue-500/50' : 'hover:bg-gray-800 border border-transparent'}
          ${isRecent ? 'ring-1 ring-blue-500/30' : ''}`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isRecent ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-sm text-gray-200 font-medium truncate max-w-[100px]">{data.symbol}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-white">${formatPrice(data.price, data.symbol)}</span>
          <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left p-4 rounded-xl border transition-all duration-200
        ${selected
          ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
          : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
        }
        ${isRecent ? 'ring-1 ring-blue-400/20' : ''}`}
    >
      {/* Live indicator */}
      {isRecent && (
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      )}

      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-xs font-medium text-gray-400 truncate max-w-[120px]">{displayName}</div>
          <div className="text-xs mt-0.5">
            <span className={`px-1.5 py-0.5 rounded text-xs ${getSourceBadge(data.source)}`}>
              {data.source?.toUpperCase()}
            </span>
          </div>
        </div>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'}`}>
          {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : <Minus size={14} />}
          <span className="text-xs font-semibold">{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
        </div>
      </div>

      <div className="text-xl font-bold font-mono text-white">
        {data.price < 1 ? '$' : '$'}{formatPrice(data.price, data.symbol)}
      </div>

      {(data.high24h || data.low24h) && (
        <div className="flex gap-3 mt-2 text-xs text-gray-500">
          <span>H: <span className="text-green-400/80">{formatPrice(data.high24h!, data.symbol)}</span></span>
          <span>L: <span className="text-red-400/80">{formatPrice(data.low24h!, data.symbol)}</span></span>
        </div>
      )}

      {data.volume && data.volume > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          Vol: {data.volume > 1e9 ? `${(data.volume / 1e9).toFixed(2)}B` :
                data.volume > 1e6 ? `${(data.volume / 1e6).toFixed(2)}M` :
                data.volume > 1e3 ? `${(data.volume / 1e3).toFixed(2)}K` :
                data.volume.toFixed(2)}
        </div>
      )}
    </button>
  );
}
