import { create } from 'zustand';

export type MarketType = 'all' | 'crypto' | 'forex' | 'synthetic' | 'volatility';
export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface MarketData {
  symbol: string;
  displayName?: string;
  price: number;
  bid?: number;
  ask?: number;
  spread?: number;
  change24h?: number;
  change24hAbs?: number;
  high24h?: number;
  low24h?: number;
  volume?: number;
  quoteVolume?: number;
  open24h?: number;
  source: 'binance' | 'deriv' | 'synthetic';
  market?: string;
  lastChange?: number;
  updatedAt?: number;
  epoch?: number;
}

export interface Signal {
  direction: 'STRONG_BUY' | 'BUY' | 'WEAK_BUY' | 'NEUTRAL' | 'WEAK_SELL' | 'SELL' | 'STRONG_SELL';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  grade: 'A' | 'B' | 'C' | 'D';
  score: number;
  isGoodSetup: boolean;
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: number;
  riskPips: number;
  rewardPips: number;
  reasons: string[];
  trendAlignment: boolean;
  adxStrength: number;
  timestamp: number;
}

export interface TradeSetup {
  symbol: string;
  displayName: string;
  market: string;
  source: string;
  price: number;
  change24h?: number;
  timeframe: string;
  signal: Signal;
  trend: { direction: string; score: number; strength: number; trendStrength: string; signals: string[] };
  patterns: Array<{ name: string; type: string; confidence: number }>;
  indicators: {
    rsi?: number;
    macd?: { macd: number; signal: number; histogram: number; bullish: boolean };
    bb?: { upper: number; middle: number; lower: number; percentB: number; position: string };
  };
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface TradingStore {
  // Connection
  wsConnected: boolean;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  setWsConnected: (v: boolean) => void;

  // Market Data
  marketData: Record<string, MarketData>;
  updateMarketData: (symbol: string, data: Partial<MarketData>) => void;
  setMarketSnapshot: (data: Record<string, MarketData>) => void;

  // Selected
  selectedSymbol: string;
  selectedTimeframe: TimeFrame;
  selectedMarketType: MarketType;
  setSelectedSymbol: (s: string) => void;
  setSelectedTimeframe: (t: TimeFrame) => void;
  setSelectedMarketType: (t: MarketType) => void;

  // Analysis
  currentAnalysis: any;
  setCurrentAnalysis: (a: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;

  // Trade Setups
  goodSetups: TradeSetup[];
  setGoodSetups: (setups: TradeSetup[]) => void;
  isScanning: boolean;
  setIsScanning: (v: boolean) => void;
  lastScanTime: number;
  setLastScanTime: (t: number) => void;

  // AI Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  isAiTyping: boolean;
  setIsAiTyping: (v: boolean) => void;

  // Watchlist
  watchlist: string[];
  addToWatchlist: (s: string) => void;
  removeFromWatchlist: (s: string) => void;

  // Alerts
  alerts: Array<{ id: string; symbol: string; condition: string; triggered: boolean; timestamp: number }>;
  addAlert: (alert: any) => void;
  removeAlert: (id: string) => void;

  // UI
  activeTab: 'dashboard' | 'scanner' | 'analysis' | 'ai' | 'watchlist' | 'settings';
  setActiveTab: (t: any) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DEFAULT_BACKEND_URL = (typeof window !== 'undefined' && (window as any).__BACKEND_URL__) || 'http://localhost:3001';

export const useTradingStore = create<TradingStore>((set) => ({
  wsConnected: false,
  backendUrl: DEFAULT_BACKEND_URL,
  setBackendUrl: (url) => set({ backendUrl: url }),
  setWsConnected: (v) => set({ wsConnected: v }),

  marketData: {},
  updateMarketData: (symbol, data) =>
    set(state => ({
      marketData: {
        ...state.marketData,
        [symbol]: { ...state.marketData[symbol], ...data, symbol, updatedAt: Date.now() },
      },
    })),
  setMarketSnapshot: (data) => set({ marketData: data }),

  selectedSymbol: 'BTCUSDT',
  selectedTimeframe: '1h',
  selectedMarketType: 'all',
  setSelectedSymbol: (s) => set({ selectedSymbol: s }),
  setSelectedTimeframe: (t) => set({ selectedTimeframe: t }),
  setSelectedMarketType: (t) => set({ selectedMarketType: t }),

  currentAnalysis: null,
  setCurrentAnalysis: (a) => set({ currentAnalysis: a }),
  isAnalyzing: false,
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),

  goodSetups: [],
  setGoodSetups: (setups) => set({ goodSetups: setups }),
  isScanning: false,
  setIsScanning: (v) => set({ isScanning: v }),
  lastScanTime: 0,
  setLastScanTime: (t) => set({ lastScanTime: t }),

  chatMessages: [],
  addChatMessage: (msg) =>
    set(state => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),
  isAiTyping: false,
  setIsAiTyping: (v) => set({ isAiTyping: v }),

  watchlist: ['BTCUSDT', 'ETHUSDT', 'frxEURUSD', 'frxGBPUSD', 'R_100', 'BOOM1000'],
  addToWatchlist: (s) =>
    set(state => ({ watchlist: [...new Set([...state.watchlist, s])] })),
  removeFromWatchlist: (s) =>
    set(state => ({ watchlist: state.watchlist.filter(w => w !== s) })),

  alerts: [],
  addAlert: (alert) =>
    set(state => ({ alerts: [...state.alerts, { ...alert, id: Date.now().toString() }] })),
  removeAlert: (id) =>
    set(state => ({ alerts: state.alerts.filter(a => a.id !== id) })),

  activeTab: 'dashboard',
  setActiveTab: (t) => set({ activeTab: t }),
  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  darkMode: true,
  toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
}));
