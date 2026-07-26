'use client';

import { useState, useEffect, useRef } from 'react';
import { api, Product, Category, ChatMessage } from '@/lib/api';
import { 
  Package, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  Send, 
  Bot, 
  User, 
  Loader2 
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Chatbot State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, catData] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        setProducts(prodData);
        setCategories(catData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, sendingChat]);

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
      const errorMsg = err instanceof Error ? err.message : 'Gagal berkomunikasi dengan AI Agent. Pastikan backend aktif.';
      setChatHistory([...newHistory, { 
        role: 'model', 
        content: `Error: ${errorMsg}` 
      }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Calculations
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalAssetValue = products.reduce((acc, curr) => acc + (curr.quantity * curr.price_buy), 0);
  const lowStockProducts = products.filter(p => p.quantity <= p.low_stock_threshold);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-slate-600 font-medium">Memuat data dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Ringkasan</h2>
        <p className="text-slate-500 mt-1">Status real-time inventaris gudang dan asisten pintar Anda.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Produk</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalProducts}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Kategori</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalCategories}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Nilai Aset (Beli)</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
              Rp {totalAssetValue.toLocaleString('id-ID')}
            </h3>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Stok Kritis</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{lowStockProducts.length}</h3>
          </div>
        </div>
      </div>

      {/* Main Sections Grid: Low Stock & AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Low Stock Alerts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-6 flex flex-col h-[500px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                Peringatan Stok Rendah
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {lowStockProducts.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
              {lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                  <span>✨ Semua stok dalam keadaan aman.</span>
                </div>
              ) : (
                lowStockProducts.map(p => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/50 transition">
                    <div className="overflow-hidden mr-2">
                      <p className="font-semibold text-slate-800 text-sm truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{p.category?.name || 'No Category'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-amber-600">{p.quantity} Pcs</p>
                      <p className="text-[10px] text-slate-400">Min. {p.low_stock_threshold}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link 
                href="/products" 
                className="w-full flex items-center justify-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/10"
              >
                Atur Produk
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant Chat */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 flex flex-col h-[500px]">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Asisten Inventaris AI</h3>
                <p className="text-xs text-emerald-600">Gemini model dengan tool query database PostgreSQL</p>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-6">
                  <div className="w-12 h-12 rounded-full bg-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-600">
                    🤖
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Tanyakan apa saja kepada AI</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      AI dapat memanggil fungsi database secara real-time untuk memeriksa stok barang, menghitung total aset, atau mencari produk.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-md">
                    <button 
                      onClick={() => setInputMessage('Barang apa saja yang stoknya hampir habis?')}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
                    >
                      🔍 Cari stok kritis
                    </button>
                    <button 
                      onClick={() => setInputMessage('Berapa total nilai barang kita saat ini?')}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
                    >
                      💰 Nilai aset total
                    </button>
                    <button 
                      onClick={() => setInputMessage('Bantu cari barang kategori elektronik')}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
                    >
                      📦 Cari barang
                    </button>
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'model' && (
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 text-xs shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 border border-slate-200/60 text-slate-800 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 text-xs shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {sendingChat && (
                <div className="flex items-start space-x-3 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 text-xs shrink-0 mt-0.5 animate-pulse">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200/60 text-slate-500 text-xs rounded-tl-none flex items-center space-x-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>AI sedang menganalisis & query database...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex space-x-3 pt-3 border-t border-slate-100">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tanyakan tentang stok, aset, atau deskripsi barang..."
                disabled={sendingChat}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={sendingChat || !inputMessage.trim()}
                className="px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center transition shadow-lg shadow-blue-500/10"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
