import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { Candle } from '../store/tradingStore';

interface MiniChartProps {
  candles: Candle[];
  symbol?: string;
  height?: number;
  showVolume?: boolean;
  entry?: number;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
}

export function MiniChart({ candles, height = 120, entry, stopLoss, takeProfit1, takeProfit2 }: MiniChartProps) {
  if (!candles?.length) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-gray-600 text-sm">
        No chart data
      </div>
    );
  }

  const data = candles.slice(-60).map(c => ({
    time: c.time,
    price: c.close,
    open: c.open,
    high: c.high,
    low: c.low,
    volume: c.volume,
  }));

  const prices = data.map(d => d.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const isUp = prices[prices.length - 1] >= prices[0];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <XAxis dataKey="time" hide />
        <YAxis domain={[minP * 0.9995, maxP * 1.0005]} hide />
        <Tooltip
          contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
          labelFormatter={() => ''}
          formatter={(v: unknown) => [(v as number).toFixed(6), 'Price']}
        />
        {entry && <ReferenceLine y={entry} stroke="#60a5fa" strokeDasharray="3 3" strokeWidth={1} />}
        {stopLoss && <ReferenceLine y={stopLoss} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />}
        {takeProfit1 && <ReferenceLine y={takeProfit1} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} />}
        {takeProfit2 && <ReferenceLine y={takeProfit2} stroke="#34d399" strokeDasharray="3 3" strokeWidth={1} />}
        <Line
          type="monotone"
          dataKey="price"
          stroke={isUp ? '#10b981' : '#ef4444'}
          strokeWidth={1.5}
          dot={false}
          animationDuration={0}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface CandleChartProps {
  candles: Candle[];
  height?: number;
  entry?: number;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
  indicators?: {
    ema9?: number[];
    ema21?: number[];
    bb?: { upper: number[]; lower: number[]; middle: number[] };
  };
}

export function PriceLineChart({ candles, height = 300, entry, stopLoss, takeProfit1, takeProfit2 }: CandleChartProps) {
  if (!candles?.length) return (
    <div style={{ height }} className="flex items-center justify-center text-gray-600">
      Loading chart data...
    </div>
  );

  const data = candles.slice(-100).map(c => ({
    time: new Date(c.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: c.close,
    open: c.open,
    high: c.high,
    low: c.low,
    volume: c.volume,
  }));

  const prices = data.map(d => d.price);
  const minP = Math.min(...prices) * 0.999;
  const maxP = Math.max(...prices) * 1.001;
  const isUp = prices[prices.length - 1] >= prices[0];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
        <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
        <YAxis
          domain={[minP, maxP]}
          tick={{ fill: '#6b7280', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v > 1000 ? `$${(v/1000).toFixed(1)}K` : `$${v.toFixed(4)}`}
          width={80}
        />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
          formatter={(v: unknown) => [`$${(v as number).toFixed(6)}`, 'Price']}
          labelStyle={{ color: '#9ca3af' }}
        />
        {entry && <ReferenceLine y={entry} stroke="#60a5fa" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: `Entry $${entry.toFixed(4)}`, fill: '#60a5fa', fontSize: 10 }} />}
        {stopLoss && <ReferenceLine y={stopLoss} stroke="#ef4444" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: `SL $${stopLoss.toFixed(4)}`, fill: '#ef4444', fontSize: 10 }} />}
        {takeProfit1 && <ReferenceLine y={takeProfit1} stroke="#10b981" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: `TP1 $${takeProfit1.toFixed(4)}`, fill: '#10b981', fontSize: 10 }} />}
        {takeProfit2 && <ReferenceLine y={takeProfit2} stroke="#34d399" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: `TP2 $${takeProfit2.toFixed(4)}`, fill: '#34d399', fontSize: 10 }} />}
        <Line
          type="monotone"
          dataKey="price"
          stroke={isUp ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          dot={false}
          animationDuration={300}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
