'use client';

import { useState, useEffect, useRef } from 'react';
import { api, ChatMessage } from '@/lib/api';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  Loader2, 
  User, 
  RotateCcw,
  Search,
  DollarSign,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, sendingChat, isOpen]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingChat) return;

    const userMsg = inputMessage;
    setInputMessage('');
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(newHistory);
    setSendingChat(true);

    try {
      const res = await api.chatWithAgent(chatHistory, userMsg);
      setChatHistory([...newHistory, { role: 'model', content: res.reply }]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal berkomunikasi dengan AI Agent.';
      setChatHistory([...newHistory, { 
        role: 'model', 
        content: `Error: ${errorMsg}` 
      }]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleResetChat = () => {
    setChatHistory([]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
          title="Buka Asisten AI"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-600 rounded-full" />
          </div>
          <span>Asisten AI</span>
          <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Floating Chat Box */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[520px] surface border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 brand-solid text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight text-slate-100">Asisten Inventaris AI</h3>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini AI Online
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              {chatHistory.length > 0 && (
                <button
                  onClick={handleResetChat}
                  title="Reset Percakapan"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/15 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Tutup Chatbot"
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/15 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 text-xs">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4 py-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Tanyakan tentang stok & gudang</p>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    AI terhubung langsung ke database PostgreSQL untuk mengecek stok, mencari barang, atau menghitung nilai aset.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full pt-2">
                  <button 
                    onClick={() => setInputMessage('Barang apa saja yang stoknya hampir habis?')}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl surface border border-slate-200 text-left text-slate-700 hover:border-blue-500 hover:text-blue-600 transition shadow-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Periksa stok kritis</span>
                  </button>
                  <button 
                    onClick={() => setInputMessage('Berapa total nilai barang kita saat ini?')}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl surface border border-slate-200 text-left text-slate-700 hover:border-blue-500 hover:text-blue-600 transition shadow-sm"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Hitung nilai aset total</span>
                  </button>
                  <button 
                    onClick={() => setInputMessage('Cari barang kategori elektronik')}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl surface border border-slate-200 text-left text-slate-700 hover:border-blue-500 hover:text-blue-600 transition shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Cari produk elektronik</span>
                  </button>
                </div>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex items-start space-x-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl max-w-[82%] text-xs ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none font-medium' 
                      : 'surface border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))
            )}

            {sendingChat && (
              <div className="flex items-start space-x-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl surface border border-slate-200 text-slate-500 text-xs rounded-tl-none flex items-center space-x-2 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>AI sedang memproses...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSendChat} className="p-3 surface border-t border-slate-200 flex items-center space-x-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pertanyaan untuk AI..."
              disabled={sendingChat}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:surface transition-all"
            />
            <button
              type="submit"
              disabled={sendingChat || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center transition shadow-md shadow-blue-500/20 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
