import { useEffect, useRef, useCallback } from 'react';
import { useTradingStore } from '../store/tradingStore';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { backendUrl, setWsConnected, updateMarketData, setMarketSnapshot } = useTradingStore();

  const connect = useCallback(() => {
    const wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws';

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected to backend');
        setWsConnected(true);
        ws.send(JSON.stringify({ type: 'ping' }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case 'snapshot':
              if (msg.data) setMarketSnapshot(msg.data);
              break;

            case 'tick':
              if (msg.symbol) {
                updateMarketData(msg.symbol, {
                  price: msg.price,
                  change24h: msg.change24h ?? msg.change,
                  volume: msg.volume,
                  high24h: msg.high24h,
                  low24h: msg.low24h,
                  bid: msg.bid,
                  ask: msg.ask,
                  spread: msg.spread,
                  source: msg.source,
                  updatedAt: msg.timestamp,
                });
              }
              break;

            case 'pong':
              break;

            default:
              break;
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected, reconnecting in 3s...');
        setWsConnected(false);
        reconnectTimerRef.current = setTimeout(() => connect(), 3000);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    } catch (err) {
      console.error('[WS] Connection error:', err);
      reconnectTimerRef.current = setTimeout(() => connect(), 5000);
    }
  }, [backendUrl, setWsConnected, updateMarketData, setMarketSnapshot]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return wsRef;
}
