const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category_id: string;
  category: Category;
  quantity: number;
  price_buy: number;
  price_sell: number;
  low_stock_threshold: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StockTransaction {
  id: string;
  product_id: string;
  product: Product;
  type: 'IN' | 'OUT';
  quantity: number;
  notes?: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// ─────────────────────────────────────────────────────
// Token helpers (localStorage, client-side only)
// ─────────────────────────────────────────────────────

export const auth = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('inv_token');
  },
  setToken: (token: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('inv_token', token);
  },
  setUser: (user: User) => {
    if (typeof window !== 'undefined') localStorage.setItem('inv_user', JSON.stringify(user));
  },
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('inv_user');
    return raw ? JSON.parse(raw) : null;
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('inv_token');
      localStorage.removeItem('inv_user');
    }
  },
  isLoggedIn: (): boolean => !!auth.getToken(),
};

// ─────────────────────────────────────────────────────
// Fetch helper — auto-attaches Authorization header
// ─────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = auth.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // If 401, clear session and redirect to login
  if (response.status === 401) {
    auth.clear();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Sesi berakhir. Silakan login kembali.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = 'Terjadi kesalahan';
    try {
      const parsed = JSON.parse(errorText);
      errorMsg = parsed.error || errorMsg;
    } catch {
      errorMsg = errorText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  // 204 No Content
  if (response.status === 204) return {} as T;

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────
// API methods
// ─────────────────────────────────────────────────────

export const api = {
  // ── Auth ──
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>('/auth/me'),

  // ── Categories ──
  getCategories: () => request<Category[]>('/categories'),
  createCategory: (data: Omit<Category, 'id' | 'created_at'>) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),

  // ── Products ──
  getProducts: () => request<Product[]>('/products'),
  getProductByID: (id: string) => request<Product>(`/products/${id}`),
  createProduct: (data: Partial<Product>) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Partial<Product>) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) =>
    request<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),

  // ── Transactions ──
  getTransactions: () => request<StockTransaction[]>('/transactions'),
  createTransaction: (data: {
    product_id: string;
    type: 'IN' | 'OUT';
    quantity: number;
    notes?: string;
  }) => request<StockTransaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),

  // ── AI ──
  suggestProductDetails: (name: string) =>
    request<{ description: string; suggested_category: string; category_id: string }>(
      '/products/ai-suggest',
      { method: 'POST', body: JSON.stringify({ name }) }
    ),
  chatWithAgent: (history: ChatMessage[], message: string) =>
    request<{ reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ history, message }),
    }),
};
