'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { auth, User } from '@/lib/api';
import { LogOut, Loader2 } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    const token = auth.getToken();
    const storedUser = auth.getUser();

    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    setTimeout(() => {
      setUser(storedUser);
      setChecking(false);
    }, 0);
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    auth.clear();
    router.push('/login');
  };

  // ── Login page: render without sidebar ──
  if (isLoginPage) {
    return <>{children}</>;
  }

  // ── Auth check loading state ──
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/products', label: 'Produk & Kategori', icon: '📦' },
    { href: '/transactions', label: 'Riwayat Transaksi', icon: '🔄' },
  ];

  // ── Main layout with sidebar ──
  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col justify-between shrink-0">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 tracking-wide">SmartStock AI</h1>
              <p className="text-xs text-blue-600 font-medium">V1.0 - Next + Go</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User info + logout */}
        <div className="p-6 border-t border-slate-200 space-y-3">
          {/* AI status */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <span className="text-xs">🤖</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-700 truncate">Gemini Active</p>
              <p className="text-[10px] text-emerald-600 font-medium truncate">Online (Local DB Tools)</p>
            </div>
          </div>

          {/* User session */}
          {user && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-700 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
