'use client';

import { useState, useEffect } from 'react';
import { api, Product, Category } from '@/lib/api';
import {
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  Loader2,
  X,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
  Tag,
  AlertCircle,
} from 'lucide-react';

interface FormErrors {
  name?: string;
  category_id?: string;
  price_buy?: string;
  price_sell?: string;
  low_stock_threshold?: string;
  quantity?: string;
  notes?: string;
}

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
    </p>
  ) : null;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // AI + errors
  const [generatingAI, setGeneratingAI] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [txErrors, setTxErrors] = useState<FormErrors>({});
  const [savingProduct, setSavingProduct] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    quantity: 0,
    price_buy: 0,
    price_sell: 0,
    low_stock_threshold: 5,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const [transactionForm, setTransactionForm] = useState({
    product_id: '',
    type: 'IN' as 'IN' | 'OUT',
    quantity: 0,
    notes: '',
  });

  // Track which product the transaction modal is for
  const [transactionProduct, setTransactionProduct] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      const [prodData, catData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([prodData, catData]) => {
        if (isMounted) {
          setProducts(prodData);
          setCategories(catData);
        }
      })
      .catch((err) => console.error('Error fetching products:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // ──────────────────────────────────────────────
  // Validation helpers
  // ──────────────────────────────────────────────
  const validateProductForm = (): boolean => {
    const errors: FormErrors = {};

    if (!productForm.name.trim()) errors.name = 'Nama barang wajib diisi';
    if (!productForm.category_id) errors.category_id = 'Pilih kategori barang';
    if (productForm.price_buy <= 0) errors.price_buy = 'Harga beli harus lebih dari 0';
    if (productForm.price_sell <= 0) errors.price_sell = 'Harga jual harus lebih dari 0';
    if (productForm.price_sell < productForm.price_buy)
      errors.price_sell = 'Harga jual tidak boleh lebih rendah dari harga beli';
    if (productForm.low_stock_threshold < 0)
      errors.low_stock_threshold = 'Ambang batas tidak boleh negatif';
    if (!editingProduct && productForm.quantity < 0)
      errors.quantity = 'Stok awal tidak boleh negatif';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateTransactionForm = (): boolean => {
    const errors: FormErrors = {};
    if (!transactionForm.quantity || transactionForm.quantity <= 0)
      errors.quantity = 'Jumlah harus lebih dari 0';
    if (
      transactionForm.type === 'OUT' &&
      transactionProduct &&
      transactionForm.quantity > transactionProduct.quantity
    )
      errors.quantity = `Stok tidak cukup. Stok saat ini: ${transactionProduct.quantity} pcs`;
    setTxErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ──────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormErrors({});
    setProductForm({
      name: '',
      sku: '',
      description: '',
      category_id: categories[0]?.id || '',
      quantity: 0,
      price_buy: 0,
      price_sell: 0,
      low_stock_threshold: 5,
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setFormErrors({});
    setProductForm({
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      category_id: p.category_id,
      quantity: p.quantity,
      price_buy: p.price_buy,
      price_sell: p.price_sell,
      low_stock_threshold: p.low_stock_threshold,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProductForm()) return;
    setSavingProduct(true);
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          name: productForm.name,
          description: productForm.description,
          category_id: productForm.category_id,
          price_buy: productForm.price_buy,
          price_sell: productForm.price_sell,
          low_stock_threshold: productForm.low_stock_threshold,
        });
      } else {
        await api.createProduct(productForm);
      }
      setShowProductModal(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Gagal menyimpan produk: ${msg}`);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await api.deleteProduct(id);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Gagal menghapus produk: ${msg}`);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCategory(categoryForm);
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Gagal membuat kategori: ${msg}`);
    }
  };

  const handleAISuggest = async () => {
    if (!productForm.name.trim()) {
      setFormErrors(prev => ({ ...prev, name: 'Tulis nama barang terlebih dahulu' }));
      return;
    }
    setGeneratingAI(true);
    try {
      const suggest = await api.suggestProductDetails(productForm.name);
      setProductForm(prev => ({
        ...prev,
        description: suggest.description,
        category_id: suggest.category_id || prev.category_id,
      }));
    } catch {
      alert('Gagal mengambil rekomendasi AI. Pastikan backend aktif dengan Gemini API Key.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleOpenTransaction = (p: Product, type: 'IN' | 'OUT') => {
    setTransactionProduct(p);
    setTxErrors({});
    setTransactionForm({ product_id: p.id, type, quantity: 0, notes: '' });
    setShowTransactionModal(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTransactionForm()) return;
    try {
      await api.createTransaction(transactionForm);
      setShowTransactionModal(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Transaksi gagal: ${msg}`);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-slate-600">Memuat data produk...</span>
      </div>
    );
  }


  // ──────────────────────────────────────────────
  // Shared input class builder
  // ──────────────────────────────────────────────
  const inputCls = (error?: string) =>
    `w-full bg-white border ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none transition`;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Manajemen Produk</h2>
          <p className="text-slate-500 mt-1">Atur stok barang gudang Anda dengan asisten rekomendasi Gemini AI.</p>
        </div>
        <div className="flex space-x-3 shrink-0">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition font-semibold text-sm border border-slate-200"
          >
            <Tag className="w-4 h-4" />
            <span>Kategori Baru</span>
          </button>
          <button
            onClick={handleOpenAddProduct}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition font-semibold text-sm shadow-lg shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel rounded-2xl p-4 flex items-center space-x-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari barang berdasarkan Nama, SKU, atau Kategori..."
          className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Nama Produk / SKU</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Stok</th>
                <th className="px-6 py-4">Harga Beli</th>
                <th className="px-6 py-4">Harga Jual</th>
                <th className="px-6 py-4 text-right">Aksi Stok</th>
                <th className="px-6 py-4 text-right">Operasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLow = p.quantity <= p.low_stock_threshold;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{p.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-700 border border-blue-500/10">
                          {p.category?.name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                            {p.quantity} Pcs
                          </span>
                          {isLow && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold">
                              Kritis
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">Rp {p.price_buy.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-slate-600">Rp {p.price_sell.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenTransaction(p, 'IN')}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 text-xs font-bold transition"
                        >
                          <TrendingUp className="w-3 h-3" /><span>Masuk</span>
                        </button>
                        <button
                          onClick={() => handleOpenTransaction(p, 'OUT')}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 text-xs font-bold transition"
                        >
                          <TrendingDown className="w-3 h-3" /><span>Keluar</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── PRODUCT MODAL ─── */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Package className="w-5 h-5 text-blue-600 mr-2" />
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto">
              {/* Nama + AI */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nama Barang <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => {
                      setProductForm({ ...productForm, name: e.target.value });
                      if (e.target.value.trim()) setFormErrors(p => ({ ...p, name: undefined }));
                    }}
                    placeholder="Nama barang..."
                    className={`flex-1 ${inputCls(formErrors.name)}`}
                  />
                  <button
                    type="button"
                    onClick={handleAISuggest}
                    disabled={generatingAI}
                    className="px-3.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white flex items-center space-x-1.5 transition text-xs font-bold disabled:opacity-50"
                  >
                    {generatingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Gemini AI</span>
                  </button>
                </div>
                <FieldError msg={formErrors.name} />
              </div>

              {/* SKU + Kategori */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    SKU <span className="text-slate-400 font-normal">(auto jika kosong)</span>
                  </label>
                  <input
                    type="text"
                    disabled={!!editingProduct}
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="SKU-BARANG"
                    className={`${inputCls()} disabled:opacity-50`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => {
                      setProductForm({ ...productForm, category_id: e.target.value });
                      setFormErrors(p => ({ ...p, category_id: undefined }));
                    }}
                    className={inputCls(formErrors.category_id)}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <FieldError msg={formErrors.category_id} />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Deskripsi Barang
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Deskripsi detail barang... (atau gunakan Gemini AI di atas)"
                  rows={2}
                  className={inputCls()}
                />
              </div>

              {/* Harga Beli + Harga Jual */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Harga Beli (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.price_buy || ''}
                    onChange={(e) => {
                      setProductForm({ ...productForm, price_buy: parseFloat(e.target.value) || 0 });
                      setFormErrors(p => ({ ...p, price_buy: undefined }));
                    }}
                    placeholder="Contoh: 50000"
                    className={inputCls(formErrors.price_buy)}
                  />
                  <FieldError msg={formErrors.price_buy} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Harga Jual (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.price_sell || ''}
                    onChange={(e) => {
                      setProductForm({ ...productForm, price_sell: parseFloat(e.target.value) || 0 });
                      setFormErrors(p => ({ ...p, price_sell: undefined }));
                    }}
                    placeholder="Contoh: 75000"
                    className={inputCls(formErrors.price_sell)}
                  />
                  <FieldError msg={formErrors.price_sell} />
                </div>
              </div>

              {/* Ambang batas + Stok Awal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Batas Stok Kritis <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.low_stock_threshold}
                    onChange={(e) => {
                      setProductForm({ ...productForm, low_stock_threshold: parseInt(e.target.value) || 0 });
                      setFormErrors(p => ({ ...p, low_stock_threshold: undefined }));
                    }}
                    className={inputCls(formErrors.low_stock_threshold)}
                  />
                  <FieldError msg={formErrors.low_stock_threshold} />
                  <p className="text-[11px] text-slate-400 mt-1">Peringatan muncul saat stok ≤ nilai ini</p>
                </div>
                {!editingProduct && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Stok Awal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.quantity}
                      onChange={(e) => {
                        setProductForm({ ...productForm, quantity: parseInt(e.target.value) || 0 });
                        setFormErrors(p => ({ ...p, quantity: undefined }));
                      }}
                      className={inputCls(formErrors.quantity)}
                    />
                    <FieldError msg={formErrors.quantity} />
                  </div>
                )}
              </div>

              {/* Margin info */}
              {productForm.price_buy > 0 && productForm.price_sell > 0 && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  productForm.price_sell >= productForm.price_buy
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <span>
                    Margin: Rp {(productForm.price_sell - productForm.price_buy).toLocaleString('id-ID')}
                    {' '}({productForm.price_buy > 0
                      ? ((( productForm.price_sell - productForm.price_buy) / productForm.price_buy) * 100).toFixed(1)
                      : 0}%)
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-lg shadow-blue-500/10 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingProduct && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingProduct ? 'Simpan Perubahan' : 'Buat Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CATEGORY MODAL ─── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Tag className="w-5 h-5 text-blue-600 mr-2" />
                Tambah Kategori Baru
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Elektronik, Pakaian, dll..."
                  className={inputCls()}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Deskripsi Kategori
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Keterangan singkat kategori..."
                  rows={3}
                  className={inputCls()}
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-lg shadow-blue-500/10">
                  Buat Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── TRANSACTION MODAL ─── */}
      {showTransactionModal && transactionProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <div className={`flex items-center justify-between p-6 border-b border-slate-200 ${
              transactionForm.type === 'IN' ? 'bg-emerald-50' : 'bg-amber-50'
            }`}>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {transactionForm.type === 'IN'
                  ? <TrendingUp className="w-5 h-5 text-emerald-600" />
                  : <TrendingDown className="w-5 h-5 text-amber-600" />}
                Stok {transactionForm.type === 'IN' ? 'Masuk' : 'Keluar'}
              </h3>
              <button onClick={() => setShowTransactionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
              {/* Product info */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                <p className="font-semibold text-slate-800">{transactionProduct.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Stok saat ini: <span className="font-bold text-slate-700">{transactionProduct.quantity} pcs</span>
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Jumlah Barang <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={transactionForm.quantity || ''}
                  onChange={(e) => {
                    setTransactionForm({ ...transactionForm, quantity: parseInt(e.target.value) || 0 });
                    setTxErrors(p => ({ ...p, quantity: undefined }));
                  }}
                  placeholder="Masukkan jumlah..."
                  className={inputCls(txErrors.quantity)}
                />
                <FieldError msg={txErrors.quantity} />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Catatan / Keterangan <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={transactionForm.notes}
                  onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                  placeholder={transactionForm.type === 'IN'
                    ? 'Contoh: Restok dari supplier PT Maju Jaya'
                    : 'Contoh: Penjualan via Shopee order #12345'}
                  rows={3}
                  className={inputCls(txErrors.notes)}
                />
                <FieldError msg={txErrors.notes} />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowTransactionModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition shadow-lg ${
                    transactionForm.type === 'IN'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10'
                      : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/10'
                  }`}
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
