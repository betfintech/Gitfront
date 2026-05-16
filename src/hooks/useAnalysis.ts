import { useCallback } from 'react';
import { useTradingStore } from '../store/tradingStore';
import toast from 'react-hot-toast';

export function useAnalysis() {
  const { backendUrl, selectedSymbol, selectedTimeframe, setCurrentAnalysis, setIsAnalyzing,
    setGoodSetups, setIsScanning, setLastScanTime } = useTradingStore();

  const analyzeSymbol = useCallback(async (symbol?: string, timeframe?: string) => {
    const sym = symbol || selectedSymbol;
    const tf = timeframe || selectedTimeframe;

    setIsAnalyzing(true);
    try {
      const res = await fetch(`${backendUrl}/api/analysis/symbol/${sym}?timeframe=${tf}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCurrentAnalysis(data);
      return data;
    } catch (err: any) {
      toast.error(`Analysis failed: ${err.message}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [backendUrl, selectedSymbol, selectedTimeframe, setCurrentAnalysis, setIsAnalyzing]);

  const scanMarkets = useCallback(async () => {
    setIsScanning(true);
    try {
      const res = await fetch(`${backendUrl}/api/analysis/scan?minGrade=B`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGoodSetups(data.setups || []);
      setLastScanTime(Date.now());
      toast.success(`Found ${data.setups?.length || 0} good setups`);
      return data;
    } catch (err: any) {
      toast.error(`Scan failed: ${err.message}`);
      return null;
    } finally {
      setIsScanning(false);
    }
  }, [backendUrl, setGoodSetups, setIsScanning, setLastScanTime]);

  const multiTimeframeAnalysis = useCallback(async (symbol: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/analysis/mtf/${symbol}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      toast.error(`MTF analysis failed: ${err.message}`);
      return null;
    }
  }, [backendUrl]);

  const fetchCandles = useCallback(async (symbol: string, timeframe: string, limit = 200) => {
    try {
      const res = await fetch(`${backendUrl}/api/analysis/candles/${symbol}?timeframe=${timeframe}&limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.candles || [];
    } catch {
      return [];
    }
  }, [backendUrl]);

  return { analyzeSymbol, scanMarkets, multiTimeframeAnalysis, fetchCandles };
}
