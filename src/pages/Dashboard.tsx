import { useEffect, useMemo } from 'react';
import { useTradingStore } from '../store/tradingStore';
import { PriceCard } from '../components/PriceCard';
import { SignalBadge } from '../components/SignalBadge';
import { useAnalysis } from '../hooks/useAnalysis';
import { TrendingUp, TrendingDown, Zap, RefreshCw, ChevronRight } from 'lucide-react';

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export function Dashboard() {
  const { marketData, setSelectedSymbol, setActiveTab, goodSetups, isScanning } = useTradingStore();
  const { scanMarkets } = useAnalysis();

  const allData = useMemo(() => Object.values(marketData).filter(m => m.price > 0), [marketData]);
  const cryptoData = allData.filter(m => m.source === 'binance').slice(0, 10);
  const forexData = allData.filter(m => m.source === 'deriv' && m.symbol?.startsWith('frx')).slice(0, 8);
  const synthData = allData.filter(m => m.source === 'deriv' && !m.symbol?.startsWith('frx')).slice(0, 6);

  const gainers = [...allData].sort((a, b) => (b.change24h || 0) - (a.change24h || 0)).slice(0, 5);
  const losers = [...allData].sort((a, b) => (a.change24h || 0) - (b.change24h || 0)).slice(0, 5);

  const liveCount = allData.filter(m => m.updatedAt && Date.now() - m.updatedAt < 5000).length;

  useEffect(() => {
    // Auto-scan on mount
    if (goodSetups.length === 0) {
      scanMarkets();
    }
  }, []);

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveTab('analysis');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time analysis across all markets</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">{liveCount} Live Updates</span>
          </div>
          <button
            onClick={() => scanMarkets()}
            disabled={isScanning}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? 'Scanning...' : 'Scan Markets'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Symbols" value={allData.length} sub="Across all markets" />
        <StatCard label="Crypto Pairs" value={cryptoData.length} sub="Binance spot" color="text-yellow-400" />
        <StatCard label="Forex Pairs" value={forexData.length} sub="Deriv live" color="text-purple-400" />
        <StatCard label="Good Setups" value={goodSetups.length} sub="Grade A & B" color="text-green-400" />
      </div>

      {/* Good Setups Alert */}
      {goodSetups.length > 0 && (
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-green-400" />
              <span className="text-green-400 font-semibold">🎯 {goodSetups.length} Active Trade Setups Found</span>
            </div>
            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center gap-1 text-green-400 text-sm hover:text-green-300"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {goodSetups.slice(0, 3).map(setup => (
              <button
                key={`${setup.symbol}_${setup.timeframe}`}
                onClick={() => { setSelectedSymbol(setup.symbol); setActiveTab('analysis'); }}
                className="flex items-center justify-between bg-gray-900/60 rounded-lg p-3 hover:bg-gray-800 transition-colors text-left"
              >
                <div>
                  <div className="text-white font-semibold text-sm">{setup.symbol}</div>
                  <div className="text-gray-400 text-xs">{setup.timeframe} • {setup.market}</div>
                </div>
                <div className="text-right">
                  <SignalBadge direction={setup.signal.direction} size="sm" />
                  <div className="text-xs text-gray-400 mt-1">
                    RR 1:{setup.signal.riskRewardRatio}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Market Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crypto */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <h2 className="text-gray-200 font-semibold">Crypto Spot (Binance)</h2>
            <span className="text-xs text-gray-500 ml-auto">{cryptoData.length} pairs</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {cryptoData.map(item => (
              <PriceCard
                key={item.symbol}
                data={item}
                onClick={() => handleSelectSymbol(item.symbol)}
              />
            ))}
          </div>
        </div>

        {/* Top Movers */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-green-400" />
              <h3 className="text-gray-200 font-semibold text-sm">Top Gainers</h3>
            </div>
            <div className="space-y-1 bg-gray-800/40 rounded-xl p-2">
              {gainers.map(item => (
                <PriceCard key={item.symbol} data={item} compact onClick={() => handleSelectSymbol(item.symbol)} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={14} className="text-red-400" />
              <h3 className="text-gray-200 font-semibold text-sm">Top Losers</h3>
            </div>
            <div className="space-y-1 bg-gray-800/40 rounded-xl p-2">
              {losers.map(item => (
                <PriceCard key={item.symbol} data={item} compact onClick={() => handleSelectSymbol(item.symbol)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forex & Synthetic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forex */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <h2 className="text-gray-200 font-semibold">Forex Pairs (Deriv)</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {forexData.slice(0, 6).map(item => (
              <PriceCard key={item.symbol} data={item} onClick={() => handleSelectSymbol(item.symbol)} />
            ))}
          </div>
        </div>

        {/* Synthetic */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <h2 className="text-gray-200 font-semibold">Synthetic Indices (Deriv)</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {synthData.slice(0, 6).map(item => (
              <PriceCard key={item.symbol} data={item} onClick={() => handleSelectSymbol(item.symbol)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
