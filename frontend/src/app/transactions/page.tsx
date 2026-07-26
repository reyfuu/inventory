'use client';

import { useState, useEffect } from 'react';
import { api, StockTransaction } from '@/lib/api';
import { Loader2, ArrowDownRight, ArrowUpRight, Calendar, Tag } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-slate-600">Memuat riwayat transaksi...</span>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Riwayat Transaksi Stok</h2>
        <p className="text-slate-500 mt-0.5 text-xs">Audit trail lengkap seluruh penambahan dan pengurangan stok barang.</p>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="tbl-cell">Waktu Transaksi</th>
                <th className="tbl-cell">Tipe</th>
                <th className="tbl-cell">Barang</th>
                <th className="tbl-cell">Kategori</th>
                <th className="tbl-cell">Jumlah</th>
                <th className="tbl-cell">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Belum ada transaksi stok tercatat.
                  </td>
                </tr>
              ) : (
                transactions.map(t => {
                  const date = new Date(t.created_at);
                  const formattedDate = date.toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="tbl-cell text-slate-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="tbl-cell">
                        {t.type === 'IN' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Stok Masuk</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                            <ArrowDownRight className="w-3 h-3" />
                            <span>Stok Keluar</span>
                          </span>
                        )}
                      </td>
                      <td className="tbl-cell font-semibold text-slate-800">
                        {t.product?.name || 'Produk Dihapus'}
                        <div className="text-xs text-slate-500 font-mono font-normal mt-0.5">
                          {t.product?.sku}
                        </div>
                      </td>
                      <td className="tbl-cell">
                        <span className="inline-flex items-center space-x-1 text-xs text-slate-500">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{t.product?.category?.name || '-'}</span>
                        </span>
                      </td>
                      <td className={`tbl-cell font-bold ${t.type === 'IN' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {t.type === 'IN' ? '+' : '-'}{t.quantity} Pcs
                      </td>
                      <td className="tbl-cell text-slate-500 max-w-xs truncate">
                        {t.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
