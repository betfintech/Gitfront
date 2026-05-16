import { useState, useRef, useEffect } from 'react';
import { useTradingStore } from '../store/tradingStore';
import { Bot, Send, Trash2, Loader, User, Zap, RefreshCw } from 'lucide-react';

import toast from 'react-hot-toast';

function MessageBubble({ msg }: { msg: { role: string; content: string; timestamp: number } }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'
      }`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'
        }`}>
          {msg.content}
        </div>
        <span className="text-xs text-gray-600">
          {new Date(msg.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

export function AIAnalyst() {
  const { backendUrl, selectedSymbol, selectedTimeframe, chatMessages,
    addChatMessage, clearChat, isAiTyping, setIsAiTyping, marketData } = useTradingStore();
  const [input, setInput] = useState('');
  const [aiAnalysisText, setAiAnalysisText] = useState('');
  const [isStreamingAnalysis, setIsStreamingAnalysis] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'deep_analysis'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || isAiTyping) return;

    setInput('');
    addChatMessage({ role: 'user', content: msg, timestamp: Date.now() });
    setIsAiTyping(true);

    try {
      const history = chatMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      addChatMessage({ role: 'assistant', content: '', timestamp: Date.now() });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantText += parsed.content;
                // Update last message
                const msgs = useTradingStore.getState().chatMessages;
                const updated = [...msgs];
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: assistantText };
                useTradingStore.setState({ chatMessages: updated });
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      toast.error(`AI Error: ${err.message}`);
      addChatMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please check your backend connection.`,
        timestamp: Date.now(),
      });
    } finally {
      setIsAiTyping(false);
    }
  };

  const runDeepAnalysis = async () => {
    if (isStreamingAnalysis) return;
    setIsStreamingAnalysis(true);
    setAiAnalysisText('');
    setActiveView('deep_analysis');

    try {
      const res = await fetch(`${backendUrl}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedSymbol, timeframe: selectedTimeframe }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullText += parsed.content;
                setAiAnalysisText(fullText);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      toast.error(`Analysis error: ${err.message}`);
    } finally {
      setIsStreamingAnalysis(false);
    }
  };

  const quickPrompts = [
    `Analyze ${selectedSymbol} for a trade setup`,
    `What is the current market sentiment?`,
    `Find the best crypto to trade right now`,
    `Explain RSI and MACD signals for ${selectedSymbol}`,
    `What are the best forex pairs today?`,
    `Scan for strong buy/sell signals`,
  ];

  const marketItem = marketData[selectedSymbol];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold">AI Trading Analyst</h1>
            <p className="text-gray-400 text-xs">Powered by DeepSeek via OpenRouter • Live market access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveView('chat')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeView === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveView('deep_analysis')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeView === 'deep_analysis' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
            >
              Deep Analysis
            </button>
          </div>
          {activeView === 'chat' && (
            <button
              onClick={clearChat}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {activeView === 'deep_analysis' ? (
        /* Deep Analysis View */
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-gray-200 font-semibold">Deep AI Analysis: {selectedSymbol}</h2>
              <p className="text-gray-400 text-sm">{selectedTimeframe.toUpperCase()} timeframe • Real-time indicators</p>
            </div>
            <button
              onClick={runDeepAnalysis}
              disabled={isStreamingAnalysis}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={isStreamingAnalysis ? 'animate-spin' : ''} />
              {isStreamingAnalysis ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>

          {marketItem && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold font-mono text-white">${marketItem.price?.toFixed(6)}</div>
                  <div className={`text-sm font-medium ${(marketItem.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(marketItem.change24h || 0) >= 0 ? '+' : ''}{(marketItem.change24h || 0).toFixed(2)}%
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  <div>Source: <span className="text-purple-400">{marketItem.source}</span></div>
                  <div>Updated: <span className="text-gray-300">{new Date(marketItem.updatedAt || 0).toLocaleTimeString()}</span></div>
                </div>
              </div>
            </div>
          )}

          {isStreamingAnalysis && !aiAnalysisText && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader size={32} className="text-purple-500 animate-spin mx-auto mb-3" />
                <div className="text-gray-300">AI is analyzing {selectedSymbol}...</div>
                <div className="text-gray-500 text-sm mt-1">Processing all technical indicators and market data</div>
              </div>
            </div>
          )}

          {aiAnalysisText && (
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <span className="text-sm text-gray-400">AI Analysis • {selectedSymbol}</span>
                {isStreamingAnalysis && <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse ml-1" />}
              </div>
              <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm">{aiAnalysisText}</div>
            </div>
          )}

          {!aiAnalysisText && !isStreamingAnalysis && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Zap size={48} className="text-purple-500 mb-4" />
              <div className="text-gray-300 font-semibold text-lg">AI Deep Analysis</div>
              <div className="text-gray-500 text-sm mt-2 max-w-md">
                Click "Run Analysis" to get a comprehensive AI-powered analysis of {selectedSymbol} including
                entry points, stop loss, take profits, and trade quality assessment.
              </div>
              <button
                onClick={runDeepAnalysis}
                className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                🤖 Run Deep Analysis
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Chat View */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <Bot size={40} className="text-gray-600 mx-auto mb-3" />
                <div className="text-gray-400 font-medium">Ask me anything about the markets!</div>
                <div className="text-gray-600 text-sm mt-1 mb-6">I have live access to all market data</div>

                {/* Quick Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg mx-auto">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="text-left text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {isAiTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800 flex-shrink-0">
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Ask about ${selectedSymbol} or any market... (Enter to send)`}
                rows={1}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 transition-colors text-sm"
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isAiTyping}
                className="flex-shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors"
              >
                {isAiTyping ? <Loader size={16} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
