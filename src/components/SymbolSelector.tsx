import { useState, useMemo } from 'react';
import { useTradingStore, MarketType } from '../store/tradingStore';
import { Search, ChevronDown } from 'lucide-react';

const MARKET_TABS: { id: MarketType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'forex', label: 'Forex' },
  { id: 'synthetic', label: 'Synthetic' },
  { id: 'volatility', label: 'Volatility' },
];

export function SymbolSelector({ onSelect }: { onSelect?: (sym: string) => void }) {
  const { marketData, selectedSymbol, setSelectedSymbol, selectedMarketType, setSelectedMarketType } = useTradingStore();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return Object.values(marketData)
      .filter(m => {
        if (!m.price) return false;
        if (selectedMarketType === 'crypto') return m.source === 'binance';
        if (selectedMarketType === 'forex') return m.source === 'deriv' && m.symbol?.startsWith('frx');
        if (selectedMarketType === 'synthetic') return m.source === 'synthetic' ||
          (m.source === 'deriv' && !m.symbol?.startsWith('frx'));
        if (selectedMarketType === 'volatility') return m.symbol?.startsWith('R_') || m.symbol?.startsWith('1HZ');
        return true;
      })
      .filter(m => !search || m.symbol?.toLowerCase().includes(search.toLowerCase()) ||
        m.displayName?.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 50);
  }, [marketData, selectedMarketType, search]);

  const selectedData = marketData[selectedSymbol] || marketData[selectedSymbol?.toUpperCase()];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg px-3 py-2 min-w-[160px] transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="text-white font-semibold text-sm">{selectedSymbol}</div>
          {selectedData?.price && (
            <div className="text-xs text-gray-400">${selectedData.price.toFixed(selectedData.price < 1 ? 6 : 2)}</div>
          )}
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50">
          {/* Search */}
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <Search size={14} className="text-gray-500" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search symbols..."
                className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Market Tabs */}
          <div className="flex gap-1 p-2 border-b border-gray-800 overflow-x-auto">
            {MARKET_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedMarketType(tab.id)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedMarketType === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Symbol List */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">No symbols found</div>
            ) : (
              filtered.map(item => (
                <button
                  key={item.symbol}
                  onClick={() => {
                    setSelectedSymbol(item.symbol);
                    onSelect?.(item.symbol);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-800 transition-colors
                    ${item.symbol === selectedSymbol ? 'bg-blue-600/10' : ''}`}
                >
                  <div className="text-left">
                    <div className="text-white text-sm font-medium">{item.symbol}</div>
                    <div className="text-xs text-gray-500">{item.displayName || item.source}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-200 text-sm font-mono">
                      ${item.price < 1 ? item.price.toFixed(6) : item.price.toFixed(2)}
                    </div>
                    <div className={`text-xs ${(item.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(item.change24h || 0) >= 0 ? '+' : ''}{(item.change24h || 0).toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}
