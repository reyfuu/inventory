'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { auth, User } from '@/lib/api';
import { 
  LogOut, 
  Loader2, 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  Bot,
  Box
} from 'lucide-react';
import AIChatWidget from '@/components/AIChatWidget';

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
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/products', label: 'Produk & Kategori', icon: Package },
    { href: '/transactions', label: 'Riwayat Transaksi', icon: ArrowRightLeft },
  ];

  // ── Main layout with sidebar ──
  return (
    <div className="h-full flex overflow-hidden bg-slate-50/50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 shadow-sm">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10">
              <Box className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 tracking-tight text-base">SmartStock AI</h1>
              <p className="text-[11px] text-slate-500 font-medium">System Inventaris</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User info + logout */}
        <div className="p-6 border-t border-slate-100 space-y-4">
          {/* AI status */}
          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">Gemini Active</p>
              <p className="text-[10px] text-emerald-600 font-medium truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Online
              </p>
            </div>
          </div>

          {/* User session */}
          {user && (
            <div className="flex items-center justify-between pt-1">
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0"
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

      {/* Global Floating AI Chatbot */}
      <AIChatWidget />
    </div>
  );
}
