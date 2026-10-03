'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Loader2, UserPlus, AlertCircle, Box } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupCode, setSignupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Nama wajib diisi.'); return; }
    if (!email.trim()) { setError('Email wajib diisi.'); return; }
    if (password.length < 8) { setError('Password minimal 8 karakter.'); return; }
    if (!signupCode.trim()) { setError('Kode pendaftaran wajib diisi.'); return; }

    setLoading(true);
    try {
      await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
        signupCode: signupCode.trim(),
      });
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Pendaftaran gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'radial-gradient(circle at 50% 0%, #eff6ff 0%, #f8fafc 100%)',
    }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/15">
                <Box className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-center">
                <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">Buat Akun</h1>
                <p className="text-xs text-slate-500 mt-0.5">SmartStock AI — Sistem Inventaris Pintar</p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-slate-600">Nama</label>
                <input
                  id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap" autoComplete="name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-slate-600">Email</label>
                <input
                  id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com" autoComplete="email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-slate-600">Password</label>
                <input
                  id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter" autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signupCode" className="text-xs font-semibold text-slate-600">Kode Pendaftaran</label>
                <input
                  id="signupCode" type="text" value={signupCode} onChange={(e) => setSignupCode(e.target.value)}
                  placeholder="Diberikan oleh administrator"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
                <p className="text-[11px] text-slate-400">
                  Aplikasi ini dapat diakses publik, jadi pendaftaran dibatasi dengan kode.
                </p>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Mendaftarkan...' : 'Daftar'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Masuk
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          SmartStock AI &copy; {new Date().getFullYear()} &mdash; Next.js + Neon Postgres + Gemini
        </p>
      </div>
    </div>
  );
}
