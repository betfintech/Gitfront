import { useEffect, useState } from 'react';
import { useTradingStore } from '../store/tradingStore';
import { useAnalysis } from '../hooks/useAnalysis';
import { SignalBadge, GradeBadge } from '../components/SignalBadge';
import { PriceLineChart } from '../components/MiniChart';
import { BarChart2, RefreshCw, TrendingUp, Zap, Activity } from 'lucide-react';

const TIMEFRAMES = ['15m', '1h', '4h', '1d'] as const;

function IndicatorGauge({ label, value, min = 0, max = 100, reverse = false }: {
  label: string; value: number | null; min?: number; max?: number; reverse?: boolean;
}) {
  if (value === null || value === undefined) return (
    <div className="bg-gray-800/60 rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-gray-600">N/A</div>
    </div>
  );

  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const isOverbought = !reverse ? value > 70 : value < -20;
  const isOversold = !reverse ? value < 30 : value > -80;
  const color = isOverbought ? 'text-red-400' : isOversold ? 'text-green-400' : 'text-yellow-400';
  const barColor = isOverbought ? 'bg-red-500' : isOversold ? 'bg-green-500' : 'bg-yellow-500';

  return (
    <div className="bg-gray-800/60 rounded-lg p-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-0.5">
        <span>{min}</span>
        <span className={`font-medium ${color} text-xs`}>
          {isOverbought ? 'Overbought' : isOversold ? 'Oversold' : 'Neutral'}
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function formatPrice(price: number): string {
  if (!price) return '0';
  if (price < 0.001) return price.toFixed(8);
  if (price < 1) return price.toFixed(6);
  if (price < 100) return price.toFixed(4);
  if (price < 10000) return price.toFixed(2);
  return price.toLocaleString();
}

function PriceLevelRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${color}`}>
      <span className="text-sm font-medium opacity-80">{label}</span>
      <span className="font-mono font-bold text-lg">${formatPrice(value)}</span>
    </div>
  );
}

export function Analysis() {
  const { selectedSymbol, selectedTimeframe, setSelectedTimeframe,
    currentAnalysis, isAnalyzing, marketData } = useTradingStore();
  const { analyzeSymbol, fetchCandles } = useAnalysis();
  const [candles, setCandles] = useState<any[]>([]);

  const marketItem = marketData[selectedSymbol] || marketData[selectedSymbol?.toUpperCase()];

  useEffect(() => {
    if (selectedSymbol) {
      loadAnalysis();
    }
  }, [selectedSymbol, selectedTimeframe]);

  async function loadAnalysis() {
    const result = await analyzeSymbol(selectedSymbol, selectedTimeframe);
    if (result?.candles) setCandles(result.candles);
    else {
      const c = await fetchCandles(selectedSymbol, selectedTimeframe, 200);
      setCandles(c);
    }
  }

  const analysis = currentAnalysis;
  const signal = analysis?.signal;
  const indicators = analysis?.indicators;
  const trend = analysis?.trend;
  const patterns = analysis?.patterns || [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BarChart2 size={20} className="text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Technical Analysis</h1>
            <div className="text-gray-400 text-sm">{selectedSymbol} • {selectedTimeframe.toUpperCase()}</div>
          </div>
          {marketItem && (
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-white font-bold font-mono">${formatPrice(marketItem.price)}</span>
              <span className={`text-sm font-medium ${(marketItem.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(marketItem.change24h || 0) >= 0 ? '+' : ''}{(marketItem.change24h || 0).toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={loadAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-blue-600/30" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            </div>
            <div className="text-gray-300 font-semibold">Analyzing {selectedSymbol}...</div>
            <div className="text-gray-500 text-sm mt-1">Computing technical indicators</div>
          </div>
        </div>
      ) : !analysis ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart2 size={48} className="text-gray-600 mb-4" />
          <div className="text-gray-400 font-semibold">Select a symbol and click Analyze</div>
        </div>
      ) : (
        <>
          {/* Signal Summary */}
          {signal && (
            <div className={`rounded-xl border p-5 ${
              signal.isGoodSetup
                ? signal.direction.includes('BUY')
                  ? 'bg-green-900/20 border-green-700/50'
                  : 'bg-red-900/20 border-red-700/50'
                : 'bg-gray-800/60 border-gray-700/50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SignalBadge direction={signal.direction} size="lg" />
                  <GradeBadge grade={signal.grade} confidence={signal.confidence} />
                  {signal.isGoodSetup && (
                    <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-2 py-1 rounded-lg text-xs font-bold">
                      <Zap size={10} /> GOOD SETUP
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm">Score</div>
                  <div className={`text-2xl font-bold ${signal.score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {signal.score > 0 ? '+' : ''}{signal.score}
                  </div>
                </div>
              </div>

              {/* Trade Levels */}
              <div className="space-y-2">
                <PriceLevelRow
                  label="🎯 Entry"
                  value={signal.entry}
                  color="text-blue-300 bg-blue-900/20 border-blue-700/40"
                />
                <PriceLevelRow
                  label="🛡️ Stop Loss"
                  value={signal.stopLoss}
                  color="text-red-300 bg-red-900/20 border-red-700/40"
                />
                <PriceLevelRow
                  label="✅ Take Profit 1 (1:2 RR)"
                  value={signal.takeProfit1}
                  color="text-green-300 bg-green-900/20 border-green-700/40"
                />
                <PriceLevelRow
                  label="🚀 Take Profit 2 (1:3 RR)"
                  value={signal.takeProfit2}
                  color="text-emerald-300 bg-emerald-900/20 border-emerald-700/40"
                />
              </div>

              {/* RR Stats */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Risk:Reward</span>
                  <span className="text-yellow-400 font-bold">1:{signal.riskRewardRatio}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Risk</span>
                  <span className="text-red-400 font-mono">{formatPrice(signal.riskPips)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Reward</span>
                  <span className="text-green-400 font-mono">{formatPrice(signal.rewardPips)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">ADX</span>
                  <span className={`font-bold ${signal.adxStrength > 40 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {signal.adxStrength?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Signal Reasons */}
              {signal.reasons?.length > 0 && (
                <div className="mt-4">
                  <div className="text-gray-400 text-xs mb-2">Signal Reasons:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {signal.reasons.map((r: string, i: number) => (
                      <span key={i} className="text-xs bg-gray-700/60 text-gray-300 px-2 py-1 rounded-full">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chart */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-200 font-semibold">Price Chart</h2>
              <span className="text-xs text-gray-500">{candles.length} candles</span>
            </div>
            <PriceLineChart
              candles={candles}
              height={280}
              entry={signal?.entry}
              stopLoss={signal?.stopLoss}
              takeProfit1={signal?.takeProfit1}
              takeProfit2={signal?.takeProfit2}
            />
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Oscillators */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-gray-200 font-semibold mb-3 flex items-center gap-2">
                <Activity size={16} className="text-blue-400" /> Oscillators
              </h3>
              <div className="space-y-3">
                <IndicatorGauge label="RSI (14)" value={indicators?.rsi?.rsi14} />
                <IndicatorGauge label="RSI (7)" value={indicators?.rsi?.rsi7} />
                {indicators?.stochastic && (
                  <>
                    <IndicatorGauge label="Stochastic %K" value={indicators.stochastic.k} />
                    <IndicatorGauge label="Stochastic %D" value={indicators.stochastic.d} />
                  </>
                )}
                <IndicatorGauge label="CCI (20)" value={indicators?.cci} min={-200} max={200} />
                <IndicatorGauge label="Williams %R" value={indicators?.williamsR} min={-100} max={0} reverse />
              </div>
            </div>

            {/* Trend Indicators */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-gray-200 font-semibold mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-green-400" /> Trend Indicators
              </h3>
              <div className="space-y-3">
                {indicators?.ema && (
                  <>
                    <div className="bg-gray-800/60 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-2">EMA Alignment</div>
                      <div className="space-y-1 text-sm font-mono">
                        {[
                          { label: 'EMA 9', value: indicators.ema.ema9, color: 'text-blue-400' },
                          { label: 'EMA 21', value: indicators.ema.ema21, color: 'text-purple-400' },
                          { label: 'EMA 50', value: indicators.ema.ema50, color: 'text-orange-400' },
                          { label: 'SMA 200', value: indicators.sma200, color: 'text-yellow-400' },
                        ].map(e => e.value && (
                          <div key={e.label} className="flex justify-between">
                            <span className="text-gray-400">{e.label}</span>
                            <span className={e.color}>${formatPrice(e.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <IndicatorGauge label="ADX (Trend Strength)" value={indicators?.adx?.adx || null} max={60} />
                  </>
                )}
                {indicators?.bollingerBands && (
                  <div className="bg-gray-800/60 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-2">Bollinger Bands</div>
                    <div className="space-y-1 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Upper</span>
                        <span className="text-red-400">${formatPrice(indicators.bollingerBands.upper)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Middle</span>
                        <span className="text-gray-300">${formatPrice(indicators.bollingerBands.middle)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lower</span>
                        <span className="text-green-400">${formatPrice(indicators.bollingerBands.lower)}</span>
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-700">
                        <span className="text-gray-400">Position</span>
                        <span className={`font-semibold ${
                          indicators.bollingerBands.position === 'above' ? 'text-red-400' :
                          indicators.bollingerBands.position === 'below' ? 'text-green-400' : 'text-blue-400'
                        }`}>{indicators.bollingerBands.position}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MACD */}
          {indicators?.macd && (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-gray-200 font-semibold mb-3">MACD (12,26,9)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">MACD Line</div>
                  <div className={`text-xl font-bold font-mono ${indicators.macd.macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {indicators.macd.macd?.toFixed(6)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Signal Line</div>
                  <div className="text-xl font-bold font-mono text-yellow-400">
                    {indicators.macd.signal?.toFixed(6)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Histogram</div>
                  <div className={`text-xl font-bold font-mono ${indicators.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {indicators.macd.histogram?.toFixed(6)}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <span className={`text-sm font-semibold ${indicators.macd.bullish ? 'text-green-400' : 'text-red-400'}`}>
                  {indicators.macd.bullish ? '↑ MACD Bullish (MACD > Signal)' : '↓ MACD Bearish (MACD < Signal)'}
                </span>
              </div>
            </div>
          )}

          {/* Patterns */}
          {patterns.length > 0 && (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-gray-200 font-semibold mb-3">📊 Detected Patterns</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {patterns.map((p: any) => (
                  <div key={p.name} className={`rounded-lg p-3 border text-center ${
                    p.type === 'bullish' ? 'bg-green-900/20 border-green-700/40 text-green-400' :
                    p.type === 'bearish' ? 'bg-red-900/20 border-red-700/40 text-red-400' :
                    'bg-gray-700/40 border-gray-600/40 text-gray-300'
                  }`}>
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className="text-xs mt-1 opacity-75 capitalize">{p.type}</div>
                    <div className="text-xs opacity-60">{p.confidence}% confidence</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support & Resistance */}
          {analysis?.supportResistance && (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-gray-200 font-semibold mb-3">📈 Support & Resistance Levels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-red-400 text-xs font-semibold mb-2 uppercase">Resistance Zones</div>
                  <div className="space-y-1">
                    {analysis.supportResistance.resistances?.slice(0, 4).map((level: number, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-red-900/10 border border-red-700/30 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-400">R{i + 1}</span>
                        <span className="font-mono text-red-400">${formatPrice(level)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-green-400 text-xs font-semibold mb-2 uppercase">Support Zones</div>
                  <div className="space-y-1">
                    {analysis.supportResistance.supports?.slice(0, 4).map((level: number, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-green-900/10 border border-green-700/30 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-400">S{i + 1}</span>
                        <span className="font-mono text-green-400">${formatPrice(level)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trend Summary */}
          {trend && (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-gray-200 font-semibold mb-3">📊 Trend Analysis</h3>
              <div className="flex items-center gap-4 mb-3">
                <div className={`text-2xl font-bold ${
                  trend.direction === 'bullish' ? 'text-green-400' :
                  trend.direction === 'bearish' ? 'text-red-400' : 'text-gray-400'
                }`}>{trend.direction?.toUpperCase()}</div>
                <div className="text-gray-400">
                  <span className="text-yellow-400 font-semibold">{trend.trendStrength}</span> trend
                  · Strength: <span className="text-white">{trend.strength?.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {trend.signals?.map((s: string, i: number) => (
                  <span key={i} className="text-xs bg-gray-700/60 text-gray-300 px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
