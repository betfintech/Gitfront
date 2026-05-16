import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTradingStore } from './store/tradingStore';
import { useWebSocket } from './hooks/useWebSocket';
import { Sidebar } from './components/Sidebar';
import { SymbolSelector } from './components/SymbolSelector';
import { Dashboard } from './pages/Dashboard';
import { Scanner } from './pages/Scanner';
import { Analysis } from './pages/Analysis';
import { AIAnalyst } from './pages/AIAnalyst';
import { Watchlist } from './pages/Watchlist';
import { Settings } from './pages/Settings';
import { Wifi, WifiOff, Moon, Sun, AlertCircle } from 'lucide-react';

function TopBar() {
  const { wsConnected, activeTab, darkMode, toggleDarkMode, selectedSymbol } = useTradingStore();

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm capitalize">{activeTab === 'ai' ? 'AI Analyst' : activeTab}</span>
        {selectedSymbol && activeTab !== 'dashboard' && (
          <span className="text-gray-600">›</span>
        )}
        {activeTab !== 'dashboard' && activeTab !== 'ai' && <SymbolSelector />}
      </div>

      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border ${
          wsConnected
            ? 'text-green-400 bg-green-400/10 border-green-400/30'
            : 'text-red-400 bg-red-400/10 border-red-400/30'
        }`}>
          {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{wsConnected ? 'Live' : 'Connecting...'}</span>
          {wsConnected && <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}

function ConnectionBanner() {
  const { wsConnected } = useTradingStore();

  if (wsConnected) return null;

  return (
    <div className="bg-orange-900/30 border-b border-orange-700/50 px-4 py-2 flex items-center gap-2 text-sm">
      <AlertCircle size={14} className="text-orange-400" />
      <span className="text-orange-300">
        Connecting to backend... Make sure the backend server is running on{' '}
        <code className="text-orange-200 bg-orange-900/40 px-1 rounded">localhost:3001</code>
      </span>
    </div>
  );
}

export default function App() {
  const { activeTab, darkMode } = useTradingStore();

  // Initialize WebSocket connection
  useWebSocket();

  // Load initial market data from REST
  useEffect(() => {
    const { backendUrl, setMarketSnapshot } = useTradingStore.getState();
    fetch(`${backendUrl}/api/market/all`)
      .then(r => r.json())
      .then(data => setMarketSnapshot(data))
      .catch(() => {}); // silent fail - ws will handle it
  }, []);

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <ConnectionBanner />

        <main className="flex-1 overflow-hidden flex">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'scanner' && <Scanner />}
          {activeTab === 'analysis' && <Analysis />}
          {activeTab === 'ai' && <AIAnalyst />}
          {activeTab === 'watchlist' && <Watchlist />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1f2937' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1f2937' } },
        }}
      />
    </div>
  );
}
