'use client';

import { useState, useEffect, useRef } from 'react';
import { api, Product, Category, ChatMessage } from '@/lib/api';
import {
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Bot,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm mt-0.5">Ringkasan statistik gudang dan status inventaris real-time.</p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl brand-solid text-white font-medium text-xs transition shadow-sm self-start md:self-auto"
        >
          <span>Kelola Barang</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="surface rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Produk</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalProducts}</h3>
          </div>
        </div>

        <div className="surface rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Kategori</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalCategories}</h3>
          </div>
        </div>

        <div className="surface rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Nilai Aset (Beli)</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Rp {totalAssetValue.toLocaleString('id-ID')}
            </h3>
          </div>
        </div>

        <div className="surface rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Stok Kritis</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{lowStockProducts.length}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Low Stock Alert & AI Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (2 cols): Low Stock Table/Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="surface rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Peringatan Stok Rendah
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Daftar produk di bawah ambang batas stok minimum.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {lowStockProducts.length} Barang
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-sm space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <span className="font-medium text-slate-600">Semua stok dalam keadaan aman.</span>
                </div>
              ) : (
                lowStockProducts.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-all">
                    <div className="overflow-hidden mr-4">
                      <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-600">{p.sku}</span>
                        <span>&bull;</span>
                        <span>{p.category?.name || 'Uncategorized'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs">
                        Stok: {p.quantity} Pcs
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Min: {p.low_stock_threshold} Pcs</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
              >
                <span>Lihat Seluruh Produk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="brand-gradient rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Bot className="w-6 h-6" />
              </div>

              <div>
                <h3 className="ai-card-title font-extrabold text-lg tracking-tight flex items-center gap-2">
                  <span>Asisten AI Gudang</span>
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </h3>
                <p className="ai-card-copy text-xs mt-2 leading-relaxed">
                  Asisten AI berbasis Gemini terhubung ke database PostgreSQL Anda. Anda dapat mengajukan pertanyaan kapan saja.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="ai-card-capabilities p-3 rounded-xl border">
                  <p className="ai-card-label font-medium">Kemampuan AI:</p>
                  <ul className="ai-card-list list-disc list-inside mt-1 space-y-1 text-[11px]">
                    <li>Cari stok barang hampir habis</li>
                    <li>Hitung nilai estimasi total aset</li>
                    <li>Generate otomatis deskripsi & kategori</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <p className="ai-card-hint text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Klik tombol <span className="ai-card-action font-semibold">&quot;Asisten AI&quot;</span> di kanan bawah untuk memulai chat.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
