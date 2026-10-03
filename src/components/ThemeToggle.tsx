'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

import {
  apply,
  readPreference,
  savePreference,
  watchSystem,
  type ThemePreference,
} from '@/lib/theme';

const ORDER: ThemePreference[] = ['light', 'dark', 'system'];

const LABEL: Record<ThemePreference, string> = {
  light: 'Tema terang',
  dark: 'Tema gelap',
  system: 'Mengikuti sistem',
};

const ICON = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

export default function ThemeToggle({ className = '' }: { className?: string }) {
  // Start as 'system' on both server and client so the first render matches;
  // the real preference is read in the effect below.
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPreference(readPreference());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (preference !== 'system') return;
    // Keep following the device while no explicit choice is set.
    return watchSystem(() => apply('system'));
  }, [preference]);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length];
    setPreference(next);
    savePreference(next);
  };

  const Icon = ICON[preference];

  return (
    <button
      type="button"
      onClick={cycle}
      title={LABEL[preference]}
      aria-label={`${LABEL[preference]}. Klik untuk mengganti tema.`}
      className={`p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shrink-0 ${className}`}
    >
      {/* Icon depends on a client-only value, so skip the hydration check. */}
      <span suppressHydrationWarning>
        <Icon className="w-4 h-4" style={{ opacity: mounted ? 1 : 0 }} />
      </span>
    </button>
  );
}
