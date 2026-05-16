import { useState } from 'react';
import { useTradingStore } from '../store/tradingStore';
import { Settings as SettingsIcon, Server, Wifi, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function Settings() {
  const { backendUrl, setBackendUrl, wsConnected, marketData } = useTradingStore();
  const [urlInput, setUrlInput] = useState(backendUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${urlInput}/api/health`);
      const data = await res.json();
      if (data.status === 'ok') {
        setTestResult('success');
        toast.success(`Connected! ${data.cachedSymbols} symbols loaded`);
      } else {
        setTestResult('error');
        toast.error('Backend responded but not healthy');
      }
    } catch (err: any) {
      setTestResult('error');
      toast.error(`Connection failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = () => {
    setBackendUrl(urlInput);
    toast.success('Settings saved. Refresh to reconnect.');
  };

  const totalSymbols = Object.keys(marketData).length;
  const bySource = {
    binance: Object.values(marketData).filter(m => m.source === 'binance').length,
    deriv: Object.values(marketData).filter(m => m.source === 'deriv').length,
    synthetic: Object.values(marketData).filter(m => m.source === 'synthetic').length,
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon size={20} className="text-gray-400" />
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      {/* Backend Config */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Server size={16} className="text-blue-400" />
          <h3 className="text-gray-200 font-semibold">Backend Configuration</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Backend URL</label>
            <div className="flex gap-2">
              <input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="http://localhost:3001"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
              />
              <button
                onClick={testConnection}
                disabled={testing}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
                Test
              </button>
              <button
                onClick={saveSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 text-sm ${testResult === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {testResult === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {testResult === 'success' ? 'Connection successful' : 'Connection failed'}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Wifi size={14} className={wsConnected ? 'text-green-400' : 'text-red-400'} />
            <span className={wsConnected ? 'text-green-400' : 'text-red-400'}>
              WebSocket: {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-gray-200 font-semibold mb-4">Market Data Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{totalSymbols}</div>
            <div className="text-gray-400 text-sm">Total Symbols</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{bySource.binance}</div>
            <div className="text-gray-400 text-sm">Binance</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{bySource.deriv}</div>
            <div className="text-gray-400 text-sm">Deriv</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{bySource.synthetic}</div>
            <div className="text-gray-400 text-sm">Synthetic</div>
          </div>
        </div>
      </div>

      {/* Deployment Guide */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-gray-200 font-semibold mb-4">🚀 Deployment Guide</h3>
        <div className="space-y-4 text-sm">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-blue-400 font-semibold mb-2">Backend → Railway</div>
            <div className="text-gray-400 space-y-1 font-mono text-xs">
              <div>1. Push <span className="text-green-300">./backend</span> folder to GitHub</div>
              <div>2. Go to railway.app → New Project → GitHub repo</div>
              <div>3. Add env: <span className="text-yellow-300">OPENROUTER_API_KEY</span>, <span className="text-yellow-300">FRONTEND_URL</span></div>
              <div>4. Railway auto-deploys from package.json start script</div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-purple-400 font-semibold mb-2">Frontend → GitHub Pages</div>
            <div className="text-gray-400 space-y-1 font-mono text-xs">
              <div>1. Push this project to GitHub</div>
              <div>2. Settings → Pages → Deploy from Actions</div>
              <div>3. Set <span className="text-yellow-300">VITE_BACKEND_URL</span> to Railway URL</div>
              <div>4. GitHub Actions builds and deploys automatically</div>
            </div>
          </div>
        </div>
      </div>

      {/* API Info */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-gray-200 font-semibold mb-4">API Information</h3>
        <div className="space-y-2 text-sm">
          {[
            { name: 'Binance REST API', status: 'Free', url: 'api.binance.com', color: 'text-green-400' },
            { name: 'Binance WebSocket', status: 'Free', url: 'stream.binance.com:9443', color: 'text-green-400' },
            { name: 'Deriv WebSocket', status: 'Free', url: 'ws.binaryws.com', color: 'text-green-400' },
            { name: 'OpenRouter AI (DeepSeek)', status: 'API Key', url: 'openrouter.ai', color: 'text-yellow-400' },
          ].map(api => (
            <div key={api.name} className="flex items-center justify-between py-2 border-b border-gray-700/50">
              <div className="text-gray-300">{api.name}</div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 font-mono text-xs">{api.url}</span>
                <span className={`text-xs font-semibold ${api.color}`}>{api.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
