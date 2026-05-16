import { useState } from 'react';
import { useTradingStore } from '../store/tradingStore';
import { PriceCard } from '../components/PriceCard';
import { Star, Plus, Trash2, Bell, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function Watchlist() {
  const { watchlist, marketData, addToWatchlist, removeFromWatchlist,
    setSelectedSymbol, setActiveTab, alerts, addAlert, removeAlert } = useTradingStore();
  const [newSymbol, setNewSymbol] = useState('');
  const [alertSymbol, setAlertSymbol] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');

  const watchlistData = watchlist.map(sym => marketData[sym] || marketData[sym.toUpperCase()]).filter(Boolean);

  const handleAdd = () => {
    const sym = newSymbol.trim().toUpperCase();
    if (!sym) return;
    addToWatchlist(sym);
    setNewSymbol('');
    toast.success(`Added ${sym} to watchlist`);
  };

  const handleAddAlert = () => {
    if (!alertSymbol || !alertPrice) return;
    addAlert({
      symbol: alertSymbol.toUpperCase(),
      condition: `${alertType === 'above' ? 'Price above' : 'Price below'} $${alertPrice}`,
      price: parseFloat(alertPrice),
      type: alertType,
      triggered: false,
      timestamp: Date.now(),
    });
    toast.success(`Alert set for ${alertSymbol}`);
    setAlertSymbol('');
    setAlertPrice('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Star size={20} className="text-yellow-400" />
        <h1 className="text-2xl font-bold text-white">Watchlist</h1>
      </div>

      {/* Add Symbol */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-gray-200 font-semibold mb-3">Add Symbol</h3>
        <div className="flex gap-2">
          <input
            value={newSymbol}
            onChange={e => setNewSymbol(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="e.g., BTCUSDT, frxEURUSD, R_100"
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Quick add suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['SOLUSDT', 'DOGEUSDT', 'frxGBPJPY', 'R_50', 'BOOM500', 'CRASH1000'].map(sym => (
            <button
              key={sym}
              onClick={() => { addToWatchlist(sym); toast.success(`Added ${sym}`); }}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-full transition-colors"
            >
              + {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Watchlist Grid */}
      {watchlistData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map(sym => {
            const data = marketData[sym] || marketData[sym.toUpperCase()];
            if (!data) return (
              <div key={sym} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-gray-300 font-medium">{sym}</div>
                  <div className="text-gray-500 text-sm">Waiting for data...</div>
                </div>
                <button
                  onClick={() => removeFromWatchlist(sym)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            );

            return (
              <div key={sym} className="relative group">
                <PriceCard
                  data={data}
                  onClick={() => { setSelectedSymbol(sym); setActiveTab('analysis'); }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromWatchlist(sym); }}
                  className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white rounded-full p-1 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Star size={32} className="mx-auto mb-2 text-gray-600" />
          <div>No symbols in watchlist</div>
        </div>
      )}

      {/* Price Alerts */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
          <Bell size={16} className="text-yellow-400" /> Price Alerts
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <input
            value={alertSymbol}
            onChange={e => setAlertSymbol(e.target.value.toUpperCase())}
            placeholder="Symbol"
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <select
            value={alertType}
            onChange={e => setAlertType(e.target.value as 'above' | 'below')}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="above">Price Above</option>
            <option value="below">Price Below</option>
          </select>
          <input
            value={alertPrice}
            onChange={e => setAlertPrice(e.target.value)}
            placeholder="Price"
            type="number"
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <button
            onClick={handleAddAlert}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Set Alert
          </button>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                alert.triggered ? 'bg-green-900/20 border-green-700/40' : 'bg-gray-700/40 border-gray-600/40'
              }`}>
                <div>
                  <div className="text-white font-medium text-sm">{alert.symbol}</div>
                  <div className="text-gray-400 text-xs">{alert.condition}</div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.triggered && <span className="text-green-400 text-xs font-semibold">TRIGGERED</span>}
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-600 text-sm">No alerts set</div>
        )}
      </div>
    </div>
  );
}
