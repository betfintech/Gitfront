import { useEffect } from 'react';
import { useTradingStore, TradeSetup } from '../store/tradingStore';
import { useAnalysis } from '../hooks/useAnalysis';
import { SignalBadge, GradeBadge } from '../components/SignalBadge';
import { RefreshCw, TrendingUp, Shield, Target, Clock, ChevronRight, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function formatPrice(price: number): string {
  if (price < 0.001) return price.toFixed(8);
  if (price < 1) return price.toFixed(6);
  if (price < 100) return price.toFixed(4);
  if (price < 10000) return price.toFixed(2);
  return price.toLocaleString();
}

function SetupCard({ setup, onSelect }: { setup: TradeSetup; onSelect: () => void }) {
  const isBuy = setup.signal.direction.includes('BUY');
  const riskPercent = Math.abs((setup.signal.stopLoss - setup.signal.entry) / setup.signal.entry * 100);

  return (
    <div className={`bg-gray-800/60 border rounded-xl overflow-hidden transition-all hover:border-opacity-80 ${
      isBuy ? 'border-green-700/50 hover:border-green-600' : 'border-red-700/50 hover:border-red-600'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${
        isBuy ? 'bg-green-900/30' : 'bg-red-900/30'
      }`}>
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold text-white">{setup.symbol}</div>
            <div className="text-xs text-gray-400">{setup.displayName} • {setup.timeframe.toUpperCase()}</div>
          </div>
          <SignalBadge direction={setup.signal.direction} size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <GradeBadge grade={setup.signal.grade} confidence={setup.signal.confidence} />
        </div>
      </div>

      {/* Price Levels */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
            <Target size={10} className="text-blue-400" /> Entry
          </div>
          <div className="text-blue-400 font-mono font-semibold text-sm">${formatPrice(setup.signal.entry)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
            <Shield size={10} className="text-red-400" /> Stop Loss
          </div>
          <div className="text-red-400 font-mono font-semibold text-sm">${formatPrice(setup.signal.stopLoss)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
            <TrendingUp size={10} className="text-green-400" /> TP1
          </div>
          <div className="text-green-400 font-mono font-semibold text-sm">${formatPrice(setup.signal.takeProfit1)}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1 text-gray-400">
          <span>R:R</span>
          <span className="text-yellow-400 font-bold">1:{setup.signal.riskRewardRatio}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <span>Risk</span>
          <span className="text-red-400">{riskPercent.toFixed(2)}%</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <span>Score</span>
          <span className={Math.abs(setup.signal.score) > 5 ? 'text-green-400' : 'text-yellow-400'}>
            {setup.signal.score > 0 ? '+' : ''}{setup.signal.score}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <span>Source</span>
          <span className="text-purple-400">{setup.source}</span>
        </div>
      </div>

      {/* Patterns & reasons */}
      {setup.patterns?.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {setup.patterns.map(p => (
            <span key={p.name} className={`text-xs px-2 py-0.5 rounded-full border ${
              p.type === 'bullish' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
              p.type === 'bearish' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
              'bg-gray-500/10 text-gray-400 border-gray-500/30'
            }`}>
              {p.name}
            </span>
          ))}
        </div>
      )}

      {/* Indicators */}
      <div className="px-4 pb-3 flex items-center gap-3 text-xs text-gray-400 border-t border-gray-700/50 pt-3">
        {setup.indicators?.rsi !== undefined && (
          <span>RSI: <span className={
            setup.indicators.rsi > 70 ? 'text-red-400' :
            setup.indicators.rsi < 30 ? 'text-green-400' : 'text-gray-300'
          }>{setup.indicators.rsi.toFixed(1)}</span></span>
        )}
        {setup.trend && (
          <span>Trend: <span className={setup.trend.direction === 'bullish' ? 'text-green-400' : 'text-red-400'}>
            {setup.trend.direction} ({setup.trend.trendStrength})
          </span></span>
        )}
        <button
          onClick={onSelect}
          className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
        >
          Analyze <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

export function Scanner() {
  const { goodSetups, isScanning, lastScanTime, setSelectedSymbol, setActiveTab } = useTradingStore();
  const { scanMarkets } = useAnalysis();

  useEffect(() => {
    if (goodSetups.length === 0) scanMarkets();
  }, []);

  const buySetups = goodSetups.filter(s => s.signal.direction.includes('BUY'));
  const sellSetups = goodSetups.filter(s => s.signal.direction.includes('SELL'));
  const gradeA = goodSetups.filter(s => s.signal.grade === 'A');

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🎯 Signal Scanner</h1>
          <p className="text-gray-400 text-sm mt-1">
            Scanning forex, crypto, synthetic & spot pairs for high-probability setups
          </p>
        </div>
        <button
          onClick={() => scanMarkets()}
          disabled={isScanning}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={isScanning ? 'animate-spin' : ''} />
          {isScanning ? 'Scanning All Markets...' : 'Rescan Markets'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white">{goodSetups.length}</div>
          <div className="text-gray-400 text-sm">Total Setups</div>
        </div>
        <div className="bg-green-900/30 border border-green-700/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{buySetups.length}</div>
          <div className="text-gray-400 text-sm">Buy Signals</div>
        </div>
        <div className="bg-red-900/30 border border-red-700/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{sellSetups.length}</div>
          <div className="text-gray-400 text-sm">Sell Signals</div>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-700/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{gradeA.length}</div>
          <div className="text-gray-400 text-sm">Grade A Setups</div>
        </div>
      </div>

      {lastScanTime > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Clock size={12} />
          Last scan: {formatDistanceToNow(lastScanTime, { addSuffix: true })}
        </div>
      )}

      {isScanning ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-600/30" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          </div>
          <div className="text-gray-300 font-semibold">Scanning Markets...</div>
          <div className="text-gray-500 text-sm mt-1">Analyzing forex, crypto, synthetic & spot pairs</div>
        </div>
      ) : goodSetups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Zap size={48} className="text-gray-600 mb-4" />
          <div className="text-gray-400 font-semibold">No setups found yet</div>
          <div className="text-gray-600 text-sm mt-1">Click "Rescan Markets" to find trading opportunities</div>
        </div>
      ) : (
        <div className="space-y-6">
          {gradeA.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-yellow-400" />
                <h2 className="text-yellow-400 font-bold">🏆 Grade A Setups (Highest Quality)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gradeA.map(s => (
                  <SetupCard
                    key={`${s.symbol}_${s.timeframe}`}
                    setup={s}
                    onSelect={() => { setSelectedSymbol(s.symbol); setActiveTab('analysis'); }}
                  />
                ))}
              </div>
            </div>
          )}

          {buySetups.filter(s => s.signal.grade !== 'A').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-green-400" />
                <h2 className="text-green-400 font-bold">Buy Signals (Grade B)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buySetups.filter(s => s.signal.grade !== 'A').map(s => (
                  <SetupCard
                    key={`${s.symbol}_${s.timeframe}`}
                    setup={s}
                    onSelect={() => { setSelectedSymbol(s.symbol); setActiveTab('analysis'); }}
                  />
                ))}
              </div>
            </div>
          )}

          {sellSetups.filter(s => s.signal.grade !== 'A').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-red-400 rotate-180" />
                <h2 className="text-red-400 font-bold">Sell Signals (Grade B)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sellSetups.filter(s => s.signal.grade !== 'A').map(s => (
                  <SetupCard
                    key={`${s.symbol}_${s.timeframe}`}
                    setup={s}
                    onSelect={() => { setSelectedSymbol(s.symbol); setActiveTab('analysis'); }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
