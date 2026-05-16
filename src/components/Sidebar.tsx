// Sidebar component
import { useTradingStore } from '../store/tradingStore';
import {
  LayoutDashboard, Search, BarChart2, Bot, Star, Settings,
  TrendingUp, Wifi, WifiOff, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scanner', label: 'Signal Scanner', icon: Search },
  { id: 'analysis', label: 'Analysis', icon: BarChart2 },
  { id: 'ai', label: 'AI Analyst', icon: Bot },
  { id: 'watchlist', label: 'Watchlist', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export function Sidebar() {
  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen, wsConnected, marketData } = useTradingStore();
  const totalSymbols = Object.keys(marketData).length;
  const liveUpdates = Object.values(marketData).filter(m => m.updatedAt && Date.now() - m.updatedAt < 5000).length;

  return (
    <div className={`relative flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <TrendingUp size={18} className="text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <div className="text-white font-bold text-sm">TradePro AI</div>
            <div className="text-gray-400 text-xs">Analysis Engine</div>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {sidebarOpen && (
        <div className="mx-3 mt-3 p-2 rounded-lg bg-gray-800 border border-gray-700">
          <div className="flex items-center gap-2">
            {wsConnected ? (
              <Wifi size={12} className="text-green-400" />
            ) : (
              <WifiOff size={12} className="text-red-400" />
            )}
            <span className={`text-xs font-medium ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
              {wsConnected ? 'LIVE' : 'OFFLINE'}
            </span>
            <div className={`ml-auto w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Activity size={10} className="text-gray-400" />
            <span className="text-xs text-gray-400">{totalSymbols} symbols · {liveUpdates} live</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 mt-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              {sidebarOpen && item.id === 'scanner' && (
                <span className="ml-auto bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded">LIVE</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Market Stats */}
      {sidebarOpen && (
        <div className="p-3 border-t border-gray-800">
          <div className="text-xs text-gray-500 mb-2">DATA SOURCES</div>
          <div className="space-y-1">
            {[
              { name: 'Binance', color: 'yellow', count: Object.values(marketData).filter(m => m.source === 'binance').length },
              { name: 'Deriv', color: 'purple', count: Object.values(marketData).filter(m => m.source === 'deriv').length },
              { name: 'Synthetic', color: 'blue', count: Object.values(marketData).filter(m => m.source === 'synthetic').length },
            ].map(src => (
              <div key={src.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full bg-${src.color}-400`} />
                  <span className="text-xs text-gray-400">{src.name}</span>
                </div>
                <span className="text-xs text-gray-300">{src.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 bg-gray-800 border border-gray-700 rounded-full p-1 text-gray-400 hover:text-white transition-colors"
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </div>
  );
}
