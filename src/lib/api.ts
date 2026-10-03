// Same-origin: the API now lives in this app's Route Handlers.
const API_BASE_URL = '/api';

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


// ─────────────────────────────────────────────────────
// Fetch helper — auto-attaches Authorization header
// ─────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  // If 401, clear session and redirect to login
  if (response.status === 401) {
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
    request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { name: string; email: string; password: string; signupCode: string }) =>
    request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
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
